In("npop-dev", function() {
	var packageName = "pageYBDQ";
	zUtil.generateNS(packageName + ".moduleInitialize.yabidaquanWidgetInit", function() {
		In("yabiDaquanModule",function(){
		var ybdic=window["pageCommon"].widget.YABI;
			ybdic.init();
		});
	});
	
	/*入口*/
	$.when(CommonPackageDeferred).done(function() {
		/*程序入口，依赖commonPackage*/
		$.each(window[packageName].moduleInitialize, function(k, v) {
			/*包装原函数禁止重复初始化*/
			window[packageName].moduleInitialize[k] = pageCommon.once(v);
			/*自动去跑moduleInitialize*/
			window[packageName].moduleInitialize[k].apply(this);
		});
	});
});
