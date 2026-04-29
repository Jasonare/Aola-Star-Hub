function addfav(e,t,url){
	t = t || document.title;
	url = url || window.location.href;
	if ( e && e.preventDefault )
		e.preventDefault();
	else    
		window.event.returnValue = false;
	
	try{
		window.external.AddFavorite(url,t);
	}catch (e){
		try{
			window.sidebar.addPanel(t, url, "");
		}catch (e){
			alert("加入收藏失败，请使用Ctrl+D进行添加");
		}
	}
}

function check_search(node,default_value){
    var default_color = '#000';
    var default_value = default_value;
    node.find('input[name="q"]').val(default_value);
    node.submit(function(){
        var text = $(this).find("input[name='q']");
        var search_value = $.trim(text.val());
        if(search_value==default_value || search_value==''){
          alert(default_value);
          text.focus();
          return false;
        }else{              
          return true;
        }
    }).find("input[name='q']").focus(function(){
      if($(this).val()==default_value){
        $(this).val("");
        default_color = $(this).css("color");
        $(this).css("color",default_color);
      }
    }).blur(function(){
      if($.trim($(this).val())==''){
        $(this).css("color",default_color)
        $(this).val(default_value);
      }
    })
}

function goto(str){	
    $('html,body').animate({scrollTop:$(str).offset().top}, 800);
}

function numNew(node,new_num){  
  var pattern = /[\.\d]+/g ;
  var str = node.html().toString();  
  var num = new_num ;
  node.html( str.replace(pattern,num) ) ;  
}

function get_flowers(o){
    var opt = {
      "id":"toupiao_comm",
      "btn_class":"toupiao_link",
      "data_class":"toupiao_num",
      "zt":"aolaxing_sh"
    };
    opt = $.extend(opt,o,{});
    var ids = get_ids( $('#'+opt.id) ) ;
    function get_ids( $node ){
        var id_arr = [] ;
        $node.find('li').each(function(){
            id_arr.push( $(this).attr('rel') ) ;
        })        
        return id_arr.join('|') ;
    }
    //喜欢    
    var url_score_api = 'http://huodong.4399.com/nhwc/flower/flower.php'; //接口地址
        
    $.ajax({
      type : "GET",
      url : url_score_api+"?ac=query&ids="+ids+"&r="+Math.random()+"&callback?",
      dataType : "jsonp",
      jsonp: 'callback',
      success : function(result){
        if(!result) return;
        if(result.res == '1'){
          $("#"+opt.id+" ."+opt.data_class).each(function(index){
            //$(this).html(result.data[index].toString());
            numNew( $(this) , result.data[index] ) ;
          });
        }
      }
    });
}

function bdshare2(title,img){
  tag = ["qzone","tqq","tsina","weixin"];
  window._bd_share_config={
    "common":{
    "bdSnsKey":"on",
    "bdDesc":title,
    "bdUrl":window.location.href,
    "bdText":title,
    "bdComment":title,
    "bdMini":"2",
    "bdMiniList":false,
    "bdPic":img,
    "bdStyle":"0",
    "onAfterClick":function(cmd){},
    "bdSize":"16"
    },"share":{}
  };
  $("head").append("<script type='text/javascript' src='http://newsimg.5054399.com/js/bdshare2.0.js' ><\/script>");
}

//武器大全显示更多
function jldq_tab(){
    var list = $("#tabs_all li");
    var temp = list;
    var show_num = 35;
    var menu_lei = $('#dtype a');
    var menu_zm = $('#g_tab_zimu a');
    var menu_xilie = $('#g_tab li');
    var default_val = '请输入要搜索的亚比名称' ;
    menu_lei.each(function(i){
      $(this).click(function(){
        menu_lei.removeClass('on');      
        menu_zm.removeClass('on') ;
        menu_xilie.removeClass('on') ;
        $(this).addClass('on');
        //if (i==0) menu_type.filter(':eq(0)').addClass('a1-on');
        var rel = $(this).attr('rel');
        if (rel){       
          temp = list.filter('[rel="'+rel+'"]');              
        } else {
          temp = list;
          menu_xilie.eq(0).addClass('on');
        }
        show_num = 35;
        show_temp();
        return false;
      });
    });
    menu_zm.each(function(i){
      $(this).click(function(){
        menu_lei.removeClass('on');      
        menu_zm.removeClass('on') ;
        menu_xilie.removeClass('on') ;
        $(this).addClass('on');        
        var rel = $(this).attr('rel');        
        if (rel){       
          temp = list.filter('[data-f="'+rel+'"]');              
        } else {
          temp = list;          
        }
        show_num = 35;
        show_temp();
        return false;
      });
    });
    menu_xilie.each(function(i){
      $(this).click(function(){
        menu_lei.removeClass('on');      
        menu_zm.removeClass('on') ;
        menu_xilie.removeClass('on') ;
        $(this).addClass('on');        
        var rel = $(this).find('a').attr('rel');
        if (rel){       
          //temp = list.filter('[data-xl="'+rel+'"]');
          // if( rel.indexOf(',') != -1 ){
              temp = list.filter(function(){
                  var xl = parseInt($(this).attr('data-xl')) ;
                  if( rel.indexOf(xl) != -1 ){
                      return $(this) ;
                  }else{
                    var xl_ttt = $(this).attr('data-ttt');
                    if (xl_ttt!='') {
                      xl_ttt = (xl_ttt.substring(xl_ttt.length - 1) == ',') ? xl_ttt.substring(0, xl_ttt.length - 1) : xl_ttt;
                      var xl_ttt_arr=xl_ttt.split(",");
                      for(var i1 = 0; i1 < xl_ttt_arr.length; i1++){
                        var test=xl_ttt_arr[i1];
                        if( rel.indexOf(test) != -1 ){
                            return $(this) ;
                        }
                      }
                    }                    
                  }
              })
          /*}else{
              temp = list.filter('[data-xl="'+rel+'"]');
          }*/
        } else {
          temp = list;
          menu_lei.eq(0).addClass('on');
        }
        show_num = 35;
        show_temp();
        return false;
      });
    });
    
    function show_temp(){
      list.hide();
      temp.filter(':lt('+show_num+')').css('display','').find('img[lz_src]').attr('lzimg','1');
      window.lzimg_load();
      if (temp.length>show_num){
        $('.more-click').css('display','');
      } else {
        $('.more-click').hide();
      }
    }
    $('.more-click').click(function(){
      show_num = show_num+35;
      temp.filter(':lt('+show_num+')').css('display','').find('img[lz_src]').attr('lzimg','1');
      window.lzimg_load();
      if (temp.length>show_num){
        $('.more-click').css('display','');
      } else {
        $('.more-click').hide();
      }
      return false;
    });
    //武器搜索框 初始化 
    var lock = false ;
    $('#search_jl').find('input:eq(0)').focus(function(){
      if( $.trim($(this).val()) == '' || $(this).val() == default_val ){
        $(this).val('').end().focus();
      }
    }).blur(function(){
      if( $.trim($(this).val()) == '' || $(this).val() == default_val ){
        $(this).val(default_val);
      }
    })
    //搜索武器
    $('#search_jl input:eq(1)').click(function(){
      menu_lei.removeClass('on');
      menu_zm.removeClass('on');
      menu_xilie.removeClass('on');
      var area = $('#tabs_all') ;
      var lis = area.find('li') ;
      var imgs = lis.find('img');
      var keyword = $('#search_jl').find('input:eq(0)').val();
      keyword = keyword.toUpperCase() ;
      var pattern = new RegExp(keyword);        
      var count = 0 ;
      if( $.trim(keyword) == '' || $.trim(keyword) == default_val ){     
        alert(default_val);            
        $('#search_jl').find('input:eq(0)').focus();
        return false;
      }
      temp = list.filter(function(){
        var alt = $(this).find('img').attr('alt');      
        alt=alt.replace(/^奥拉星/,'');
        alt = alt.toUpperCase() ;
        var flag = pattern.test(alt);
        if( flag ){       
          count++;
          return $(this);
        }
      })
      if( count == 0 ){
        alert('你搜索的亚比不存在，请输入正确的亚比名称才能搜索到哦！');
        $(this).prev().focus();
        $('#dtype').find('a:eq(0)').click();
        return false;
      }
      show_num = 35;
      show_temp();
      $('.sort a').removeClass('cur');
      return false;
    });
    
    $('#search_jl').find('input:eq(0)').keyup(function(e){
      if( lock ){
        return false ;
      }
      var e = e || window.event ;   
      if( e.keyCode == 13 ){      
        lock = true ;
        $('#search_jl input:eq(1)').click();      
        setTimeout(function(){
          lock = false ;
        },200);     
      }
      return false;
    })
}

function copyUrl(node){  // $(this) 
    try{      
      if(window.clipboardData){               
        var clipBoardContent = node.html() ;    
        window.clipboardData.setData("Text",clipBoardContent);
        alert("已复制好！");       
      }else{
        alert('你的浏览器不支持复制功能,请用Ctrl+C进行复制');
      }
    }catch(e){
      alert('你的浏览器不支持复制功能,请用Ctrl+C进行复制');
    }
}