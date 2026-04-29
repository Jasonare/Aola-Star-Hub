/*打开新的包导入方式开关*/
var newPackageImportPlug = true;
/*包定义
************************************/
In.add("pingFen", {
	path: "http://www.100bt.com/resource/js/plugins/pingfen.js"
});
In.add("createMedia", {
	path: "http://www.100bt.com/media/createMedia.js"
});

In.add("pagination",{
	path:"http://www.100bt.com/resource/js/lib/jquery.pagination.js"
})
In.add("ZCarouselBase", {
	path: "http://www.100bt.com/resource/js/plugins/zcarousel/base.js",
	rely: ["npop-dev"]
});
In.add("Zzoomer", {
	path: "http://www.100bt.com/resource/js/plugins/zcarousel/Zzoomer.js",
	rely: ["ZCarouselBase"]
});
In.add("ZCarousel", {
	path: "http://www.100bt.com/resource/js/plugins/zcarousel/zcarousel.js",
	rely: ["ZCarouselBase"]
});
In.add("Jinglingcalulator", {
	path: "http://www.100bt.com/resource/js/plugins/yabiCal/jinglingcalculator.js",
	rely: ["npop-dev"]
});

In.add("tucao", {
	path: "http://www.100bt.com/resource/js/plugins/tucao/tucao.js",
	rely: ["npop-dev"]
});

In.add("Voter", {
	path: "http://www.100bt.com/resource/js/plugins/vote/Voter.js",
	rely: ["npop-dev"]
});

In.add("shareRenderer", {
	path: "http://www.100bt.com/resource/js/plugins/sharerenderer.js",
	rely: ["npop-dev"]
});
In.add("scrollLoader", {
    path : "http://www.100bt.com/resource/js/lib/jquery.scrollLoader.js",
    type : "js"
});
In.add("crossRequest", {
	path: "http://my.100bt.com/chat/js/crossRequest.js"
});
In.add("mediaStyle", {
	path: "http://www.100bt.com/media/media.css"
});
In.add("media", {
	path: "http://www.100bt.com/media/media.js",
	rely: ["crossRequest", "mediaStyle"]
});
In.add("itipsCSS", {
	path:"http://www.100bt.com/qq/style/itips.css",
	type:"css"
});
In.add("itips", {
	path:"http://www.100bt.com/qq/script/itips.js",
	type:"js",
	rely:["itipsCSS"]
});
In.add("yabiDaquanModule",{
	path:"http://resource.a0bi.com/aola/dev/script/ybdq.js?20160229",
	rely:["npop-dev"]
});
var CommonPackageDeferred=$.Deferred();

In("npop-dev", function() {
	var packageName="pageCommon";
/*基础标签切换
*************************************/
	zUtil.generateNS(packageName+".tabChangeHandler", function(e) {
		var index = $(this).index();
		$(this).addClass("on").siblings("a").removeClass("on");
		var j = $(this).closest(".ztab").siblings(".zcontents").find(".zcontent").hide().eq(index);
		var k = $(this).closest(".ztab").siblings(".relativeContents").find(".relativeContent").hide().eq(index);
		j.show();
		k.show();
		if (!j.attr("hasInit")) {
			pageCommon.loadImg(j.find("img"));
			j.attr("hasInit", "true");
		}
	});
/*基础图片lazyload
*************************************/
	zUtil.generateNS(packageName+".loadImg", function($imgArray) {
		$imgArray.each(function() {
			$(this).attr("src", function() {
				return $(this).attr("dsrc");
			});
		});
	});
/*献花初始化函数
*************************************/
	zUtil.generateNS(packageName+".initFlower", function(_root) {
		/*献花绑定*/
		var roots = _root.find(".voteItem");
		roots.each(function() {
			var id = $(this).attr("articleId");
			var context = $(this);
			context.click(function(e) {
				e.preventDefault();
				var that = this;
				if ($(this).attr("lock") === "true" || !$(this).hasClass("hasInit")) {
					showAlert("休息一下，再来支持吧~");
					return false;
				}
				$(this).attr("lock", "true");
				In("pingFen", function() {
					pingfenWidget.add(id, function() {
						$(that).find(".numb").text(function(k, v) {
							return +v + 1;
						});
						setTimeout(function() {
							$(that).attr("lock", "false");
						}, 5000)
					});
				});
				setTimeout(function() {
					$(that).attr("lock", "false");
				}, 10000)
			});
			In("pingFen", function() {
				pingfenWidget.get(id, function(score) {
					context.find(".numb").text(score).end().addClass("hasInit");
				});
			});
		});
	});
/*包装函数队列的工具方法
*************************************/
	zUtil.generateNS(packageName+".wrapQueueFunction", function() {
		var g = Array.prototype.slice.call(arguments, 0);
		var s = $.map(g, function(v, k) {
			if ($.isFunction(v)) {
				return v
			}
		});
		return function() {
			var that = this;
			var arg = arguments;
			$.each(s, function(k, v) {
				v.apply(that, arg)
			});
		};
	});
/*包装函数初始化的工具方法
*************************************/
	zUtil.generateNS(packageName+".once", function(func) {
		var g = function() {
			if (g.hasRun) {
				return;
			}
			g.hasRun = true;
			func.apply(this, arguments);
		}
		return g;
	});



	zUtil.generateNS(packageName+".rankBoardInitializer.sidebar_yuanchuangRank", function() {
		var root = null;

		var articleRankTemplate = '<li articleId="${articleId}"><a href="${url}" target="_blank"><i class="${rankClass}"><span class="rank">${rank}</span><span class="d"></span></i>${title}</a><span>${flower}人气</span></li>';

		function getDataByCatId(catId, containerSelector) {
			$.getJSON("http://service.100bt.com/flower/queryGwFlowerRankList.jsonp?callback=?", {
				categoryId: catId,
				rankModel: 1
			}, function(data) {
				var s = "";
				if (data.rankList && $.isArray(data.rankList)) {
					$.each(data.rankList, function(k, v) {
						s += zUtil.template(articleRankTemplate, {
							evenClass: k % 2 === 0 ? "" : "even",
							rank: k + 1,
							rankClass: "rank" + (k + 1),
							url: v.link || "http://aola.100bt.com/",
							title: v.imgTitle || "",
							flower: v.flowerCount || 0,
							articleId: v.articleId || ""
						});
					});
					root.find(containerSelector).html(s);
				}
			});
		}

		function bind() {
			root.on("mouseover", ".ztab>a", pageCommon.tabChangeHandler);
		}
		return {
			init: function() {
				root = $("#ycph");
				In("npop-dev", function() {
					/*手绘鼠绘*/
					getDataByCatId(8496, ".zcontents .zcontent ul:eq(0)");
					/*四格漫画*/
					getDataByCatId(11835, ".zcontents .zcontent ul:eq(1)");
					/*原创文章*/
					getDataByCatId(8502, ".zcontents .zcontent ul:eq(2)");
				});
				bind();
				root.find(".ztab>a:first").mouseover();
			},
			getDataByCatId: getDataByCatId
		}
	});
	zUtil.generateNS(packageName+".rankBoardInitializer.shipinRank", function(containerSelector,categoryId) {
		var movieRankTemplate0 = '<li class="mvRankItem mvRankItem_first clearfix"><a href="${url}" class="w_img" target="_blank"><img src="${imgSrc}" alt="${title}" /><i class="rankIcon">${rank}</i></a><div class="info"><p class="tt">${a.title}</p><p>播放:${playTimes}次</p><p>鲜花:${flower}</p></div></li>',
			movieRankTemplate1 = '<li><a href="${url}" target="_blank" title="${title}"><i class="${rankClass}"><span class="rank">${rank}</span><span class="d"></span></i>${title}</a><span>${flower}人气</span></li>';
		/*291默认为全部视频的占位类别*/
		function setContent(selector,type){
			var def=getDataByType(type);
			function render(data){
				var s = "";
				if (data.rankList && $.isArray(data.rankList)) {
					$.each(data.rankList, function(k, v) {
						//s+=zUtil.template(k>0?movieRankTemplate1:movieRankTemplate0,{
						s += zUtil.template(movieRankTemplate1, {
							rank: k + 1,
							rankClass: "rank" + (k + 1),
							url: v.link || "http://aola.100bt.com/",
							title: v.imgTitle || "",
							flower: (type=="0"?v.icFlowerCount:v.flowerCount)||0,
							articleId: v.articleId || "",
							imgSrc: v.imgUrl || "",
							playTimes: v.playTimes || 0
						});
					});
				}
				return s;

			}
			def.done(function(data){
				var s=render(data);
				$(selector).html(s);
			});
		}
		function getDataByType(type){
			/*
			0周
			2月
			1总
			 */
			return $.getJSON("http://service.100bt.com/flower/queryGwFlowerRankList.jsonp?callback=?", {
				categoryId: categoryId||290,
				rankModel: type
			});
		}
		function bind(){
			containerSelector.on("mouseover", ".ztab>a", pageCommon.tabChangeHandler);
		}
		function init(){

			bind();
			containerSelector.find(".ztab>a:first").mouseover();
			setContent(containerSelector.find(".zcontent:eq(0) ul"),0);
			setContent(containerSelector.find(".zcontent:eq(1) ul"),2);
			setContent(containerSelector.find(".zcontent:eq(2) ul"),1);

		}
		init();
	});

	zUtil.generateNS(packageName+".moduleInitialize.bindGlobalEvents", function() {
		zUtil.SimplePSCenter.listen("boxContentChange",function(){
			if($.browser.msie&&$.browser.version<=7){
				$(".clearfixEx").each(function(){
					var g=$(this).find(".ie6ClearfixPadding");
					var s=$(this).find(">*:first").get(0);
					s=s?s.tagName:"span";
					if(g.length<=0){
						$(this).append($("<"+s.toLowerCase()+">",{"class":"ie6ClearfixPadding","style":"float:left;width:1px;height: 1px;clear: both;visibility: hidden;overflow: hidden;"}));
					}
				});
			}
		});
		zUtil.SimplePSCenter.trigger("boxContentChange");

		/*收藏按钮绑定*/
		$(".topbg .favBtn").click(function(){
			Util.AddFavorite(globalInfo.URL,"百田奥拉星");
		});
		/*搜索*/
		In("npop-dev",function(){
			/*SearchModule*/
			$(".searchbar_js,.searchbar_js_b").on("focus",".txt",zUtil.inputTipsHanldler.focus);
			$(".searchbar_js,.searchbar_js_b").on("blur",".txt",zUtil.inputTipsHanldler.blur);
			$(".searchbar_js,.searchbar_js_b").on("keyup",".txt",zUtil.inputTipsHanldler.keyup);
			$(".searchbar_js").on("submit","form",function(e){
				var v=$.trim($(this).find(".txt").val());
				var d=$(this).find(".txt").attr("zdefaultValue")
				if(v===d||v===""){
					In("itips", function(){
						jqTips.add(".searchbar_js .txt", {autoHide:false,html:"<span class='etip'>请输入搜索关键字</span>", position:{left:"50%",top:0}}).remove(2500);
					});
					return false;
				}
			})
			$(".searchbar_js_b").on("submit","form",function(e){
				var v=$.trim($(this).find(".txt").val());
				var d=$(this).find(".txt").attr("zdefaultValue")
				if(v===d||v===""){
					In("itips", function(){
						jqTips.add(".searchbar_js_b .txt", {autoHide:false,html:"<span class='etip'>请输入搜索关键字</span>", position:{left:"50%",top:0}}).remove(2500);
					});
					return false;
				}
			})
		});
		ajaxLogin.runCommonLoginCheck();
	});

	/*****普通列表页滚动加载****/
	function scrollLoadMore($ele) {
		var scrollLoadTimer;
		var n = 0;
		function loadMore() {
			if (scrollLoadTimer) {
				clearTimeout(scrollLoadTimer);
			}
			scrollLoadTimer = setTimeout(function() {
				var scrollT = $(window).scrollTop() + $(window).height();
				var listT = $ele.height() + $ele.offset().top;
				if (scrollT  > listT) {
					$ele.find(".itemHide").slice(0,10).removeClass("itemHide");
					if (n == 0) {
						n++;
					} else {
						$("#pagination").show();
					}
				}
			}, 100);
		}

		$(window).unbind('scroll').scroll(function() {
			loadMore();
		});
	}
	function scrollLoadMoreInit(){
		var len=$(".zcontents .zul .normalArticleItem").length;
		if(len>0){
			scrollLoadMore($(".zcontents"));
		}
		if(len>10){
			$("#pagination").hide();
		}
	}
	scrollLoadMoreInit();

	$.each(window[packageName].moduleInitialize, function(k, v) {
		/*包装原函数禁止重复初始化*/
		window[packageName].moduleInitialize[k] = pageCommon.once(v);
		/*自动去跑moduleInitialize*/
		window[packageName].moduleInitialize[k].apply(this);
	});
	CommonPackageDeferred.resolve();
	/*这里只保证同步的commonPackage初始化代码执行完毕*/
});

/*热门奥雅小游戏*/
;(function(){
	var $hotGameRank=$("#hotGameRankList").find(".hotGameRank");
	function renderHotGame(){
		var HotGame_html = '<li class="toh"><span class="icon icon%{num}">%{num}</span><a href="%{url}" target="_blank" class="imgWrp"><img src="%{imgUrl}" alt="%{title}" class="img" /></a><a href="%{url}" target="_blank" class="txt toh">%{title}</a></li>';
		$.getJSON("http://service.100bt.com/article/queryListByCidsAndPower.jsonp?cids=23018&limit=10&callback=?", function(d) {
			var str_html = '';
			if (d.data) {
				var len = d.data.length;
				if (len > 0) {
					for (var i = 0; i < len; i++) {
						var dact = d.data[i].contentMap,
						  url = dact.link,
						  imgUrl = dact.imgUrl,
						  title = d.data[i].articleTitle,
						  k = {
							url: url,
							imgUrl: imgUrl,
							title: title,
							num: i+1
						};
						str_html += Util.template(HotGame_html, k, /\%{([^{}]*)}/g);
					}
				}
				$hotGameRank.html($(str_html));
			}
		});
	}
	if($hotGameRank.length>0){
		renderHotGame();
	}
})();


