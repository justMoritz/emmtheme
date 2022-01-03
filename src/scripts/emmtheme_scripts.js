/**
 *
 * Scripts for emmtheme, the simple, clean, and easy housetheme for mzcom.
 * Mostly related to Ajax-loading the content for the website!
 *
 * As it goes, I didn't have a ton of time re-doing my portfolio site,
 * so my idea was to use Gutenberg and the twentytwentyone theme,
 * with a simple Child Theme to handle some of the corner cases.
 *
 * In fact, it started out so simple that I didn't even bother creating any
 * Gulp processes, and its SCSS compliation was done in php.
 *
 * As it also goes, custom functionality quickly expanded and so here we are :)
 *
 * Incidentally, this theme has a repo if you're curious (and I hope you are!)
 * https://github.com/justMoritz/emmtheme
 *
 * Have a wonderful day :)
 *
 */

var emmthemeAjaxJs = (function($){

  var $contentHolder, $menu, savedScripts;


  /**
   * Sets variables on page load
   */
  var init = function(){
    $contentHolder = document.querySelector("#main");
    $scriptholder  = document.querySelector("#reexecutescripts");
    $menu          = document.querySelector("#primary-menu-list");

    $contentHolder.classList.add("emmtheme-animationtimer");
    savedScripts = $scriptholder.innerHTML;
  };


  /**
   * Updates the Nav Menus during Ajax Call
   */
  var _setMenu = function( passedUrl ){

    $(".current-menu-item").removeClass("current-menu-item");

    $("#primary-menu-list").find("a").each(function(){
      var $this = $(this);
      if( $this.attr("href") == passedUrl ){
        $this.parent(".menu-item").addClass("current-menu-item");
      }
    });
  }; // end _setMenu()


  /**
   * Main Ajax Call. Called during link-click or URL navigation
   * @param  {string} passedUrl The URL of the page requested,
   *                            either clicked or from History
   */
  var _callAjax = function( passedUrl ){

    $.ajax({
      type: "post",
      url: emmthemeAjax.ajaxurl,
      data: {
        action: "emmtheme_route",
        passed_url: passedUrl,
      }
    }).done(function( message ){
      message = JSON.parse( message );

      // update bodyclass page-id
      $('body')[0].className =  $('body')[0].className.replace(/\bpage\-id\-[0-9]\d{0,4}/g, 'page-id-'+message.id);

      // update the content with the newly fetched one
      var cur_post_class = "";
      for(var pci = 0; pci < message.post_class.length; pci++)
        cur_post_class += " " + message.post_class[pci];
      $contentHolder.innerHTML =
        '<article id="'+message.post_type+'-'+message.id+'" class="'+cur_post_class+'">'
        + '<div class="entry-content">'
        + message.content
        + '</div>';
        + '</article>';

      // update the page title
      document.title = message.title;

      // makes sure everthing is visible
      setTimeout(function(){
        $contentHolder.classList.remove("this--fadedout");
      }, 250);

      // make new history entry
      history.pushState({}, "", passedUrl);

      // updates the nav menus
      _setMenu(passedUrl);

      // recompile gallery and plugin
      baguetteBox.run('.blocks-gallery-grid');
      halveSpacersOnMobile.init();

      // re-execute scripts
      eval(savedScripts); // 🙍🏼‍♀️

      // update edit button
      $("#wp-admin-bar-edit a").attr("href", "https://portfolio.moritz.blue/wp-admin/post.php?post="+message.id+"&action=edit")

      // TODO: Yoast Title and Meta
    });

  }; // end _callAjax()


  /**
   * Old functionality used during debugging.
   * Leaving it here because it's so delightfully hacky
   */
  var fallback = function(){

    var $allLinks = document.querySelectorAll("#masthead a, #masthead-i a, #homeoverview a, .portfolio-post-grid a");
    for(var a=0; a < $allLinks.length; a++){
      var $this = $allLinks[a];

      $this.onclick = function(event) {
        if (
          event.ctrlKey ||
          event.shiftKey ||
          event.metaKey || // apple
          (event.button && event.button == 1) // middle click, >IE9 + everyone else
        ){
          return;
        }else{
          // add fadeout class
          document.querySelector("body").classList.add("this--fadeout");

          // after a while, start checking if it"s there
          // and remove again in case something went wrong
          var $maz_body = document.querySelector("body");
          setTimeout(function(){
            var checkForOverlay = setInterval(function() {
              if( $maz_body.classList.contains("this--fadeout") ){
                $maz_body.classList.remove("this--fadeout");
                clearInterval(checkForOverlay);
              }
              else {
                console.log("checking again");
              }
            }, 1500); // end setInterval
          }, 500); // end setTimeOut
        }
      } // end onclick

    }
  }; // end fallback()


  /**
   * Listeners for Ajax-related calls
   */
  var initAjax = function(){

    var $allLinks = document.querySelectorAll("#page a");

    $("#page").on("click", "a", function(e){
      var $curA         = $(this);
      var currentHref   = $curA.attr("href");
      var currentTarget = $curA.attr("target");


      // skip to default behaviour
      // if we have an image link, or on-page link,
      // or opens in new tab
      // or the link is not part of the same page,
      if(
        currentHref.includes("wp-content/uploads") ||
        currentHref.includes("#") ||
        currentTarget === "_blank" ||
        (!currentHref.startsWith("/") && !currentHref.includes(emmthemeAjax.homeurl) )
      ){
        return;
      }

      else{

        e.preventDefault();
        this.blur();

        // fade out the content and call the ajax function
        $contentHolder.classList.add("this--fadedout");

        // scroll back to top
        setTimeout(function(){
          window.scrollTo(0, 0);
        }, 550);

        _callAjax( currentHref );

      } // end else (if not exceptions)

    }); // end link click


    window.addEventListener("popstate", function(event) {
      if( location.href.includes("wp-content/uploads") || location.href.includes("#")  ){
        return;
      }
      else{
        $contentHolder.classList.add("this--fadedout");
        _callAjax( location.href );
      }

    });

  }; // end initAjax()


  return{
    init: init,
    initAjax: initAjax,
    fallback: fallback,
  };

})(jQuery);


document.addEventListener("DOMContentLoaded", function() {
  // emmthemeAjaxJs.fallback();
  emmthemeAjaxJs.init();
  emmthemeAjaxJs.initAjax();
});