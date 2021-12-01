<?php

/**
 * Function that reasonably minifies output
 */
function maz_sanitize_output($buffer) {
  $search = array('/\>[^\S ]+/s','/[^\S ]+\</s','/(\s)+/s', '/\/\*(.|\s)*?\*\//','/[\n\r]/');
  $replace = array('>','<','\\1','','');
  $buffer = preg_replace($search, $replace, $buffer);
  return $buffer;
}



/**
 * SCSS compiler workflow
 */

# Sets up SCSS compiler
require_once "lib/scss.inc.php";
use ScssPhp\ScssPhp\Compiler;
$compiler = new Compiler();


# load SCSS files
$scss_includes = [
  '/src/_general.scss',
  '/src/_blocks.scss',
  '/src/_theme.scss',
  '/src/_classes.scss',
  '/src/_header.scss',
  '/src/_forms.scss',
];
$compiled_scss = '';
$scss_string = '';

foreach ($scss_includes as $file) {
  $scss_string .= file_get_contents(__DIR__ .$file);
}

$compiled_scss = $compiler->compileString($scss_string)->getCss();
$compiled_scss = maz_sanitize_output($compiled_scss);

# render to head
add_action('wp_head', function(){
  global $compiled_scss;
  echo '<style id="emmstyles">';
  echo $compiled_scss;
  echo '</style>';
}, 9);



/**
 * Theme setup
 */
add_action('after_setup_theme', function(){
  add_image_size('maz_4', 4, 4);
  add_image_size('maz_8', 8, 8);
  add_image_size('maz_900', 900, 900);
  add_image_size('maz_1400', 1500, 1500);
  add_image_size('maz_1800', 1800, 1800);
});



/**
 * Avoid Typography Widows
 * Code taken from https://www.kevinleary.net/fix-hanging-words-wordpress/
 */
function maz_avoid_content_widows( $content ) {
    $pattern = '@(?:\s)([[:punct:][:word:]]+)(?:\s)(?!/>)([[:punct:][:word:]]+)(?:\s)([[:punct:][:word:]]+)</(p|h1|h2|h3|h4|h5|h6)>@m';
    $replacement = '&nbsp;$1&nbsp;$2&nbsp;$3</$4>';
    $content = preg_replace( $pattern, $replacement, $content, -1 );

    return $content;
}
// add_filter( 'the_content', 'maz_avoid_content_widows' );



/**
 * Adds pre-loader image to Gutenberg image and gallery block
 */
function maz_wrap_image_blocks( $block_content, $block ) {

  $return_string = $block_content;

  if( $block["blockName"] === "core/gallery" ) {

    $randomID = "mazgalleryid" + rand(10, 100);
    $return_string .= "<style>";

    $maz_gal_incrementer = 1;
    foreach( $block["attrs"]["ids"] as $this_image_id) {
      $small_image_size = wp_get_attachment_image_src($this_image_id, 'maz_8');
      $return_string .= '[data-mazthisgalid="'.$randomID.'"] .blocks-gallery-item:nth-child('.$maz_gal_incrementer.'){background-image: url("'.$small_image_size[0].'")}';
      $maz_gal_incrementer++;
    }

    $return_string .= "</style>";
    $return_string = str_replace( 'class="wp-block-gallery', 'data-mazthisgalid="'.$randomID.'" class="wp-block-gallery', $return_string );
  }


  if ( $block['blockName'] === 'core/image' || $block['blockName'] === 'core/cover' ) {

    $small_image_size = wp_get_attachment_image_src($block['attrs']['id'], 'maz_8');

    $return_string = str_replace("<img", "<div class='wp-block-image__image-preloader' role='presentation' style='background-image: url( ".$small_image_size[0]." )'></div><img", $return_string );
  }
  return $return_string;
}
add_filter( 'render_block', 'maz_wrap_image_blocks', 10, 2 );