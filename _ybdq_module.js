/*亚比大全*/
(function() {
	var root = $("#yabiDic"),itemPerLine = 6,line,allItem = root.find(".ybit"),line = allItem.filter(":nth-child(" + itemPerLine + "n+1)");

	function startScroll() {
		var sTop = $(window).scrollTop(),wh = $(window).height(),toHandle = [];
		var topLine, bottomLine;
		/*找出符合要求的元素*/
		for (var i = 0; i < line.length;) {
			topLine = $(line[i]).offset().top, bottomLine = topLine + $(line[i]).height();
			if (topLine >= sTop && topLine <= sTop + wh || bottomLine >= sTop && bottomLine <= sTop + wh) {
				toHandle = toHandle.concat(line.splice(i, 1));
			}else{
				i++;
			}
		}
		/*遍历符合要求元素并且初始化该行的元素*/
		$.each(toHandle, function(k, v) {
			var offset = $(v).index(),
				lastPos = offset + itemPerLine;
			allItem.slice(offset, lastPos).each(function() {
				$(this).find("img").attr("src", function() {
					return $(this).attr("dsrc")
				});
			});
		});
		if (!line.length) {
			$(window).unbind("scroll", startScroll);
		}
	}

	var curType=[13000,-1,-1];

	function updateYabiView(successData){
		var tp='\
			<li class="ybit ${jinglingIconClass}"\
			jinghuaSrc="${jinghuaImg}">\
			<a href="${tjlink}" class="ybitem" target="_blank" title="${imgTitle}">\
				<img dsrc="${imgUrl}" src="" alt="${imgTitle}">\
				<span>${imgTitle}</span>\
				<span class="dt"></span>\
			</a>\
			<div class="agroup">\
				<a href="${tjlink}" target="_blank" class="l btn-view"></a>\
			</div>\
		</li>\
		';
		var wrap = $(".tbContainer").find("ul");
		if(successData){
			var toRender=$(successData.rst).map(function(k,a){
				return Util.template(tp,{
					jinglingIconClass:a.fieldMap&&a.fieldMap.addIcon?("jinghuaIcon_"+a.fieldMap.addIcon):"",
					jinghuaImg:a.fieldMap&&a.fieldMap.jinghuaImg?a.fieldMap.jinghuaImg:"",
					fbLink:a.fieldMap&&a.fieldMap.fbLink?a.fieldMap.fbLink:"",
					tjlink:a.fieldMap && a.fieldMap.tjlink ? a.fieldMap.tjlink : (a.fieldMap.skillListStr ? a.link : ''),
					sfLink:a.fieldMap&&a.fieldMap.sfLink?a.fieldMap.sfLink:"",
					imgTitle:a.articleTitle,
					imgUrl: a.imgUrl
				});
			}).get().join("");
			wrap.html(toRender);
			/*刷新数组*/
			allItem = root.find(".ybit");
			line = allItem.filter(":nth-child(" + itemPerLine + "n+1)");
			$(window).unbind("scroll",startScroll).bind("scroll", startScroll);
			$(window).scroll();
		}else{
			wrap.find(".ybit,.noyb").remove();
			wrap.prepend($('<li class="noyb">没有亚比~看看别的分类如何？</li>'));
		}
	}
	function getDataByCurType(){
		var D=$.Deferred();
		$.getJSON("http://service.100bt.com/article/queryListByCids.jsonp?callback=?",{
			cids:$(curType).filter(function(k,v){
				return v>-1?true:false;
			}).get().join(",")
		},function(data){
			if(data.res.code>=0&&data.data&&data.data.length>0){//有数据
				D.resolve({
					rst:data.data
				});
			}else{//没数据或者错误
				D.reject();
			}
		})
		return D.promise();
	}
	function renderTabBycurType (){
			$(".sortTypeLine ul li").removeClass("on").filter(function(){
				function has(arr,int){
					for(var i=0;i<arr.length;i++){
						if(int===arr[i]){
							return true;
						}
					}
				}
				var type=parseInt($(this).find("a").attr("dqtype"));
				if(has(curType,type)){
					return true;
				}else{
					return false;
				}
			}).addClass("on");
		}
	var YabiDaQuan = {
		curType:curType,
		renderTabBycurType:renderTabBycurType,
		init: function(isHome) {
			$(root).on("click", ".sortTypeLine ul li a", function() {
				var that=$(this);
				var index=that.closest("ul").data("sorttype");
				var typeid=parseInt(that.attr("dqtype"));
				curType[index]=typeid;
				if(index==0){
					curType[1]=-1
					curType[2]=-1
				}
				if(index==1){
					curType[2]=-1
				}
				renderTabBycurType();
				getDataByCurType().always(updateYabiView);
				return false;
			});

			//滚动显示
				$(window).bind("scroll", startScroll);
				$(window).scroll();
		}
	};

	zUtil.generateNS("pageCommon.widget.YABI", YabiDaQuan);

})();
/*搜索*/
var yabiSearch = ({
	tamplate : '<li class="ybit ${jinghuaIcon}">'+
						'<a href="${tjlink}" class="ybitem" target="_blank" title="${imgTitle}">'+
							'<img dsrc="${imgUrl}" src="${src}" alt="${imgTitle}">'+
							'<span>${imgTitle}</span>'+
							'<span class="dt"></span>'+
						'</a>'+
						'<div class="agroup">'+
							'<a href="${tjlink}" target="_blank" class="l btn-view"></a>'+
						'</div>'+
					'</li>',
	// getData: function(txtInput){
	// 	$.getJSON('http://service.100bt.com/article/queryList.jsonp?callback=?&categoryName='+encodeURIComponent("奥拉星_亚比大全列表")+'&articleTitle='+encodeURIComponent(txtInput),function(d){
	// 		yabiSearch.buildHtml(d.data);
	// 	})
	// },
	getData: function(txtInput){
		$.getJSON('http://service.100bt.com/article/query/title.jsonp?callback=?&cids=13000&title='+encodeURIComponent(txtInput),function(d){
			yabiSearch.buildHtml(d.data);
		})
	},
	buildHtml:function(d){
		var len = d.length,str_html='';
		this.init();
		if(len == 0){
			$(".tbContainer ul").html("<p class='noyabi'>没有搜索到相关的亚比信息，换个关键词试试吧~</p>");
			return false;
		}
		var j = $.trim(yabiSearch.tamplate);
		$(d).each(function(i,v){
			var  k= {
				jinghuaIcon : 'jinghuaIcon_'+v.fieldMap.addIcon?v.fieldMap.addIcon:'',
				tjlink:v.fieldMap && v.fieldMap.tjlink ? v.fieldMap.tjlink : (v.fieldMap.skillListStr ? v.link : ''),
				title : v.articleTitle,
				src : v.imgUrl,
				fbLink : v.fieldMap.fbLink?v.fieldMap.fbLink:'',
				sfLink : v.fieldMap.sfLink?v.fieldMap.sfLink:'',
				imgTitle:v.articleTitle,
				imgUrl: v.imgUrl
			}
			str_html += Util.template(j, k, /\${([^{}]*)}/g);
		});
		$('.tbContainer ul').html(str_html);
	},
	init: function(){
		$(".searchYB_js_b").on("focus",".txt",zUtil.inputTipsHanldler.focus).on("blur",".txt",zUtil.inputTipsHanldler.blur).on("keyup",".txt",zUtil.inputTipsHanldler.keyup);
		$(".searchYB_js_b").on("keydown",".txt",function(e){
			if(e.keyCode == 13){
				var v = $(this).val();
				yabiSearch.searchFun(v);
			}
		})
		$(".searchYB_js_b").on("click",".submitBtn",function(e){
			var v=$.trim($(this).siblings(".txt").val());
			yabiSearch.searchFun(v);
		})
		return this;
	},
	searchFun:function(v){
		pageCommon.widget.YABI.curType[0]=13000;
		pageCommon.widget.YABI.curType[1]=-1;
		pageCommon.widget.YABI.curType[2]=-1;
		pageCommon.widget.YABI.renderTabBycurType();
		var d=$(this).find(".txt").attr("zdefaultValue");
		if(v===d||v===""){
			In("itips", function(){
				jqTips.add(".searchYB_js_b .txt", {autoHide:false,html:"<span class='etip'>请输入搜索关键字</span>", position:{left:"50%",top:0}}).remove(2500);
			});
			return false;
		}else{
			yabiSearch.init = function(){
				$(".searchYB_js_b").on("keyup",".txt",function(e){
					if(e.keyCode == 13){
						var v = $(this).val();
						yabiSearch.searchFun(v);
					}
				})
				$(".searchYB_js_b").on("click",".submitBtn",function(e){
					pageCommon.widget.YABI.curType[0]=13000;
					pageCommon.widget.YABI.curType[1]=-1;
					pageCommon.widget.YABI.curType[2]=-1;
					pageCommon.widget.YABI.renderTabBycurType();
					var v=$.trim($(this).siblings(".txt").val());
					yabiSearch.searchFun(v);
				})
			}
			$(".searchYB_js_b").off("keyup",".txt");
			$(".searchYB_js_b").off("click",".submitBtn");
			yabiSearch.getData(v);
		}
	}
}).init();

