<?php
/**
 * Premier Heritage theme.
 *
 * Page layouts for developments, plots and house types live in /template-parts.
 * With Elementor Pro, any of them can be replaced by a Theme Builder template
 * (header, footer, single development, single house type) — the theme steps
 * aside automatically when one is assigned.
 */

defined( 'ABSPATH' ) || exit;

define( 'PREMIER_THEME_VERSION', '1.0.0' );

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'custom-logo', array( 'height' => 85, 'width' => 485, 'flex-height' => true, 'flex-width' => true ) );
	register_nav_menus( array(
		'primary' => 'Main menu',
		'footer'  => 'Footer menu',
	) );
} );

/** Elementor Pro Theme Builder: let header, footer, single and archive templates replace the theme's. */
add_action( 'elementor/theme/register_locations', function ( $manager ) {
	$manager->register_all_core_location();
} );

add_action( 'wp_enqueue_scripts', function () {
	$uri = get_template_directory_uri();
	$dir = get_template_directory();
	// Version each file by when it last changed, so caches (WP Rocket, Cloudflare) pick up updates
	$ver = fn( $file ) => PREMIER_THEME_VERSION . '.' . (int) @filemtime( $dir . $file );
	wp_enqueue_style( 'premier-heritage', $uri . '/assets/css/heritage.css', array(), $ver( '/assets/css/heritage.css' ) );
	wp_enqueue_style( 'premier-wordpress', $uri . '/assets/css/wordpress.css', array( 'premier-heritage' ), $ver( '/assets/css/wordpress.css' ) );
	wp_enqueue_script( 'premier-theme', $uri . '/assets/js/theme.js', array(), $ver( '/assets/js/theme.js' ), true );
} );

// The design uses its own self-hosted fonts, so Elementor's default Google Fonts (Roboto) aren't loaded
add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );

// WP Rocket "Delay JavaScript execution": the theme's small scripts (menu, animations,
// site plan) and the form's anti-spam field run straight away, so nothing waits for a first scroll or tap
add_filter( 'rocket_delay_js_exclusions', function ( $exclusions ) {
	return array_merge( (array) $exclusions, array(
		'premier-heritage/assets/js/theme.js',
		'premier-developments/assets/',
		'documentElement.className',
		// WPForms hides its anti-spam field with a small inline script
		'wpforms-conversational-form-page',
	) );
} );

// WP Rocket "Remove unused CSS": keep the theme's stylesheets whole, as the menu, animations,
// lightbox and site plan add their classes with JavaScript after the page loads
add_filter( 'rocket_rucss_safelist', function ( $safelist ) {
	return array_merge( (array) $safelist, array(
		'/wp-content/themes/premier-heritage/assets/css/(.*).css',
		'.wpforms-(.*)',
	) );
} );

add_action( 'wp_head', function () {
	// Lets the scroll animations hide content only when JavaScript is running
	echo "<script>document.documentElement.className += ' js';</script>\n";
	// Self-hosted fonts: inlined so they don't block rendering, with the two used above the fold preloaded
	$fonts = get_template_directory_uri() . '/assets/fonts/';
	foreach ( array( 'cormorant-garamond', 'jost' ) as $font ) {
		echo '<link rel="preload" href="' . esc_url( $fonts . $font . '.woff2' ) . '" as="font" type="font/woff2" crossorigin>' . "\n";
	}
	$css = (string) @file_get_contents( get_template_directory() . '/assets/css/fonts.css' );
	echo '<style id="premier-fonts">' . str_replace( '../fonts/', esc_url( $fonts ), $css ) . "</style>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
}, 1 );

/**
 * Site icon (browser tab, phone home screen, Google results): the PP monogram
 * from the logo, unless one is chosen under Appearance › Customise › Site Identity.
 */
add_filter( 'get_site_icon_url', function ( $url, $size ) {
	// $url may hold WordPress's own default (for /favicon.ico), so only a chosen icon wins
	if ( get_option( 'site_icon' ) ) {
		return $url;
	}
	foreach ( array( 32, 180, 192, 270, 512 ) as $available ) {
		if ( $available >= $size ) {
			break;
		}
	}
	return get_template_directory_uri() . '/assets/img/icon/icon-' . $available . '.png';
}, 10, 2 );

/** Pages whose first section is a full-height photo get the transparent header. */
function premier_has_hero() {
	if ( is_singular( array( 'development', 'house_type' ) ) || is_post_type_archive( 'development' ) ) {
		return true;
	}
	if ( is_front_page() || is_page() ) {
		$id = get_queried_object_id();
		if ( $id && get_post_meta( $id, '_elementor_edit_mode', true ) === 'builder' ) {
			$data = (string) get_post_meta( $id, '_elementor_data', true );
			$pos  = strpos( $data, '"widgetType"' );
			if ( false === $pos ) {
				return false;
			}
			$first = substr( $data, $pos, 48 );
			return str_starts_with( $first, '"widgetType":"premier-hero"' ) || str_starts_with( $first, '"widgetType":"premier-page-header"' );
		}
	}
	return false;
}

add_filter( 'body_class', function ( $classes ) {
	$classes[] = premier_has_hero() ? 'has-hero' : 'no-hero';
	return $classes;
} );

/** Data from the Premier Developments plugin, or safe defaults when it is not active. */
function premier_company() {
	if ( class_exists( 'Premier_Data' ) ) {
		return Premier_Data::company();
	}
	return array(
		'name'      => get_bloginfo( 'name' ),
		'strapline' => get_bloginfo( 'description' ),
		'phone'     => '',
		'mobile'    => '',
		'email'     => get_bloginfo( 'admin_email' ),
		'address'   => array(),
		'about'     => '',
		'stats'     => array(),
	);
}

function premier_tel( $n ) {
	return 'tel:' . preg_replace( '/[^0-9+]/', '', (string) $n );
}

/** Menu links as plain anchors, matching the Heritage header and footer. */
function premier_menu_links( $location, $class = 'draw', $wrap_li = false ) {
	$locations = get_nav_menu_locations();
	if ( empty( $locations[ $location ] ) ) {
		return '';
	}
	$items = wp_get_nav_menu_items( $locations[ $location ] );
	$out   = '';
	foreach ( (array) $items as $item ) {
		if ( $item->menu_item_parent ) {
			continue;
		}
		$current = untrailingslashit( $item->url ) === untrailingslashit( home_url( add_query_arg( array() ) ) );
		$link    = '<a class="' . esc_attr( $class . ( $current ? ' is-current' : '' ) ) . '" href="' . esc_url( $item->url ) . '"' . ( $current ? ' aria-current="page"' : '' ) . '>' . esc_html( $item->title ) . '</a>';
		$out    .= $wrap_li ? '<li>' . $link . '</li>' : $link;
	}
	return $out;
}

/** Where the header "Enquire" button goes: the enquiry band on development pages, else the home page contact section. */
function premier_enquire_url() {
	if ( is_singular( array( 'development', 'house_type' ) ) ) {
		return '#enquire';
	}
	$contact = function_exists( 'premier_page_url' ) ? premier_page_url( 'contact' ) : '';
	return $contact ? $contact : home_url( '/#contact' );
}

/** URL of one of the site's main pages (current, completed, about, contact), or ''. */
function premier_page_url( $role ) {
	return class_exists( 'Premier_Data' ) ? Premier_Data::page_url( $role ) : '';
}

/**
 * The logo in the header and footer. A light version is used over the photo
 * hero and in the navy footer; the dark one once the header turns ivory.
 * Both can be replaced under Appearance › Customise › Site Identity.
 */
function premier_wordmark( $light = false ) {
	$theme    = get_template_directory_uri() . '/assets/img/';
	$dark_id  = (int) get_theme_mod( 'custom_logo' );
	$light_id = (int) get_theme_mod( 'premier_logo_light' );
	$name     = premier_company()['name'];
	// Shown 31–44px tall in the header (about 177–251px wide) and 48px in the footer
	$sizes    = $light ? '274px' : '(max-width: 400px) 177px, (max-width: 720px) 205px, 251px';
	// The footer logo ($light) sits below the fold, so it loads lazily
	$load     = ( $light ? ' loading="lazy"' : '' ) . ' decoding="async"';
	$img      = function ( $id, $file, $class, $alt ) use ( $theme, $sizes, $load ) {
		if ( $id ) {
			$src    = wp_get_attachment_image_url( $id, 'full' );
			$srcset = (string) wp_get_attachment_image_srcset( $id, 'full' );
		} else {
			// Smaller copies so phones don't download the full-width logo
			$src    = $theme . $file . '.webp';
			$srcset = $theme . $file . '-260.webp 260w, ' . $theme . $file . '-360.webp 360w, ' . $src . ' 485w';
		}
		return '<img class="' . $class . '" src="' . esc_url( $src ) . '"'
			. ( $srcset ? ' srcset="' . esc_attr( $srcset ) . '" sizes="' . esc_attr( $sizes ) . '"' : '' )
			. ' alt="' . esc_attr( $alt ) . '" width="485" height="85"' . $load . '>';
	};
	return '<a class="brand-logo' . ( $light ? ' is-light' : '' ) . '" href="' . esc_url( home_url( '/' ) ) . '" aria-label="' . esc_attr( $name . ' — home' ) . '">'
		. $img( $dark_id, 'logo', 'logo-dark', $name )
		. $img( $light_id ?: $dark_id, 'logo-light', 'logo-light', '' )
		. '</a>';
}

/**
 * Where each development's interactive site plan appears:
 *  'inline' (default, Heritage B): in the development page's Homes section
 *  'page'   (Heritage A): on its own /developments/<name>/plots/ page
 */
function premier_plots_inline() {
	return get_theme_mod( 'premier_plots_layout', 'inline' ) !== 'page';
}
add_filter( 'premier_plots_inline', 'premier_plots_inline' );

/** Customiser: a second logo for dark backgrounds, and the site plan layout. */
add_action( 'customize_register', function ( $wp_customize ) {
	$wp_customize->add_section( 'premier_developments', array(
		'title'    => 'Developments',
		'priority' => 30,
	) );
	$wp_customize->add_setting( 'premier_plots_layout', array(
		'default'           => 'inline',
		'sanitize_callback' => fn( $v ) => 'page' === $v ? 'page' : 'inline',
	) );
	$wp_customize->add_control( 'premier_plots_layout', array(
		'label'       => 'Interactive site plan',
		'description' => 'Where visitors explore the plots of a development.',
		'section'     => 'premier_developments',
		'type'        => 'radio',
		'choices'     => array(
			'inline' => 'On the development page (Heritage B)',
			'page'   => 'On its own Plots page (Heritage A)',
		),
	) );

	$wp_customize->add_setting( 'premier_logo_light', array( 'sanitize_callback' => 'absint' ) );
	$wp_customize->add_control( new WP_Customize_Media_Control( $wp_customize, 'premier_logo_light', array(
		'label'       => 'Logo for dark backgrounds',
		'description' => 'Shown over the photo at the top of pages and in the footer. Use a version with light text.',
		'section'     => 'title_tagline',
		'mime_type'   => 'image',
		'priority'    => 9,
	) ) );
} );

/** Template part with the plugin's data; shows a notice if the plugin is missing. */
function premier_requires_plugin() {
	if ( class_exists( 'Premier_Data' ) ) {
		return true;
	}
	echo '<main id="main" class="section"><div class="wrap"><p>Please activate the <strong>Premier Developments</strong> plugin.</p></div></main>';
	return false;
}
