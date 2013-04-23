define(function(require){
  require("libs/zepto.js");

  var lastContent = "";
  var contacting  = false;

  $("#W_email"  ).on("invalid", function(){ invalid( $(this), "请输入你的Email。" ); return false; });
  $("#W_content").on("invalid", function(){ invalid( $(this), "请输入5个字以上有意义的内容。" ); return false; });
  $("#W_contact").on("submit", function( evt ){

    if ( contacting ) { return; }

    // Validate
    var d = validate();
    if ( !d ) { return; }

    // Check for repeating.
    if ( lastContent == d.content ) {
      invalid( $content, "你刚才已经发过一遍了。" );
      return;
    }
    lastContent = d.content;

    showLoading();
    // Send a post.
    $.ajax({
          url      : form.submitURL
        , dataType : 'jsonp'
        , jsonp    : 'jsonp'
        , data     : d
        , success  : onSendSuccess
        , error    : onSendSuccess
        , complete : hideLoading
    });

    
    return false;
  });

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
      invalid( $emailVal, "请输入你的Email。" );
      return null;
    }

    return { "email" : emailVal, "content": contentVal };
  }

  function invalid ( target, error ) {
    // TODO : Show customize popup;
    // If the error is shown on submit button, it is auto-closed.
  }

  function showLoading() { contacting = true;  $("#W_contact").addClass("contacting");    }
  function hideLoading() { contacting = false; $("#W_contact").removeClass("contacting"); }

  function onSendSuccess ( data ) 
  {
    var e = "失败了，不如你直接发邮件给我吧：liangmorr@gmail.com";
    var s = "发送成功，我会尽快回复你的。";
    invalid( $("#W_submit"), data && data.result == "success" ? s : e );
  }
});
