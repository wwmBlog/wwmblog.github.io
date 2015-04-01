define(function(require){

  var Tooltip = require("src/tooltip.js");

  var lastContent = "";
  var contacting  = false;

  $("#W_email, #W_content").on("blur", function(){
    console.log("blur");
    Tooltip.hide( this );
  })

  $("#W_email")
    .on("invalid", function(){ invalid( $(this), "请输入你的Email。" ); return false; })
    .on("keyup", onInputChange);
  $("#W_content")
    .on("invalid", function(){ invalid( $(this), "请输入5个字以上有意义的内容。" ); return false; })
    .on("keyup", onInputChange);

  $("#W_contact").on("submit", function( evt ){

    Tooltip.hide( $("#W_submit")[0] );

    if ( contacting ) { return false; }

    // Validate
    var d = validate();
    if ( !d ) { return false; }

    // Check for repeating.
    if ( lastContent == d.content ) {
      invalid( $("#W_content"), "你刚才已经发过一遍了。" );
      return false;
    }
    lastContent = d.content;

    showLoading();
    // Send a post.
    $.ajax({
          url      : "http://lmmail.herokuapp.com"
        , dataType : 'jsonp'
        , type     : "GET"
        , data     : d
        , success  : onSendSuccess
        , error    : onSendSuccess
        , complete : hideLoading
    });

    
    return false;
  }).on("keypress", function( evt ){
    if ( $(evt.target).is("input") ) {
      evt.stopPropagation();
    }
  });

  function onInputChange () {
    var value = $(this).val();
    if ( this.id == "W_email" ) {
      if ( /[\w\d_\.\-]+@([\w\d_\-]+\.)+[\w\d]{2,4}/.test(emailVal) ) {
        Tooltip.hide(this);
      }
    } else if ( this.id == "W_content" ) {
      if ( value.length > 5 ) {
        Tooltip.hide(this);
      }
    }
  }

  function validate() {
    // Validate
    var $email     = $("#W_email");
    var $content   = $("#W_content");
    var emailVal   = $email.val();
    var contentVal = $content.val();

    if ( !contentVal || contentVal.length < 6 ) {
      invalid( $content, "请输入5个字以上有意义的内容。" );
      return null;
    }

    if ( !emailVal || ! /[\w\d_\.\-]+@([\w\d_\-]+\.)+[\w\d]{2,4}/.test(emailVal) ) {
      invalid( $email, "请输入你的Email。" );
      return null;
    }

    return { "email" : emailVal, "content": contentVal };
  }

  var invalidTM = null;
  function invalid ( $target, error ) {
    if ( invalidTM == null ) {
      Tooltip.show( $target[0], { content : error, margin : 30, extraClass : "error" } );
      invalidTM = setTimeout( function(){ invalidTM = null; }, 50 );
    }
  }

  function showLoading() { contacting = true;  $("#W_contact").addClass("contacting");    }
  function hideLoading() { contacting = false; $("#W_contact").removeClass("contacting"); }

  function onSendSuccess ( data ) 
  {
    var e = data && data.result == "Success" ?
              "发送成功，我会尽快回复你的。" :
              "失败了，不如你直接发邮件给我吧：<a href='mailto:liangmorr@gmail.com'>liangmorr@gmail.com</a>"

    Tooltip.show( $("#W_submit")[0], { 
        content    : e
      , margin     : 30
      , extraClass : data && data.result == "Success" ? "success" : "error"
    });

    setTimeout( function(){ Tooltip.hide($("#W_submit")[0]); }, 2000 );
  }
});
