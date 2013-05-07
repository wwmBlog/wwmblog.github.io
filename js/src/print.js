define(function(require){

  require("libs/zepto.js");

  // Bio
  $(".personal .value.name").html("\u6881\u6587\u6d69");
  $(".personal .value.age").html( (new Date()).getUTCFullYear() - 1990 );
  $(".personal .value.phone").html("136" + "5130" + "2717");

  // Skill
  ;(function(){
    var sk_data  = require("data/skill.js");
    var labels   = sk_data.shortLabels;
    var html_arr = [];
    var html     = "";

    var data = sk_data.datasets[1].data;
    for (var i = 0; i < data.length; ++i ) {
      if ( data[i] != null ) {
        html_arr.push('<li><span class="label">' 
                    + labels[i] 
                    +'</span><span class="level level' +
                    + data[i].v
                    + '"></span></li>');
      }
    }

    data = sk_data.datasets[0].data;
    for ( i = 0; i < data.length; ++i ) {
      if ( data[i] != null ) {
        html_arr.push('<li class="basic"><span class="label">' 
                    + labels[i] 
                    +'</span><span class="level level' +
                    + data[i].v
                    + '"></span></li>');
      }
    }

    for ( i = 0; i < html_arr.length; ++i ) {
      if ( i % 5 == 0 ) {
        if ( i != 0 ) {
          html += '</ul>';
        }

        html += '<ul class="skill-list">'
      }
      html += html_arr[i];
    }

    $(html).appendTo($("#W_printSkill"));

  })();

  

});
