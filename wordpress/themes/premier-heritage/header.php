<?php
/**
 * Site header. Replaced by an Elementor Pro Theme Builder header when one is assigned.
 */

defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main">Skip to content</a>
<?php
if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'header' ) ) :
	?>
	<header class="site-header" id="top">
		<div class="wrap header-inner">
			<?php echo premier_wordmark(); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav">
				<span class="nav-toggle-bars" aria-hidden="true"></span>
				<span class="sr-only">Menu</span>
			</button>
			<nav class="site-nav" id="site-nav" data-nav aria-label="Main">
				<?php echo premier_menu_links( 'primary' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<a class="btn btn-gold btn-sm nav-cta" href="<?php echo esc_url( premier_enquire_url() ); ?>">Enquire</a>
			</nav>
		</div>
	</header>
	<?php
endif;
