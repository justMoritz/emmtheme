<?php
/**
 * Displays header site branding
 *
 * @package WordPress
 * @subpackage Twenty_Twenty_One
 * @since Twenty Twenty-One 1.0
 */

$blog_info    = get_bloginfo( 'name' );
$description  = get_bloginfo( 'description', 'display' );
$show_title   = ( true === get_theme_mod( 'display_title_and_tagline', true ) );
$header_class = $show_title ? 'site-title' : 'screen-reader-text';

$custom_logo_id = get_theme_mod( 'custom_logo' );

?>

<?php if ( has_custom_logo() && $show_title ) : ?>
  <div class="site-logo test">
    <?php if(false){ the_custom_logo(); } ?>
    <a href="<?=get_home_url()?>" class="custom-logo-link" rel="home">
      <?= wp_get_attachment_image(
        get_theme_mod( 'custom_logo' ),
        "full", "",
        array( "class" => "custom-logo" )
      );?>
    </a>
  </div>
<?php endif; ?>
