<?php
/**
 * Plugin Name:       Premier Developments
 * Description:       Developments, house types and plots for Premier Property (Central). Adds the interactive site plan, plot tables and house type pages, with Elementor widgets and shortcodes to place them. Requires ACF Pro (or Secure Custom Fields).
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      8.0
 * Author:            CADS Ltd
 * Text Domain:       premier-developments
 */

defined( 'ABSPATH' ) || exit;

define( 'PREMIER_DEV_VERSION', '1.0.0' );
define( 'PREMIER_DEV_FILE', __FILE__ );
define( 'PREMIER_DEV_DIR', plugin_dir_path( __FILE__ ) );
define( 'PREMIER_DEV_URL', plugin_dir_url( __FILE__ ) );

require_once PREMIER_DEV_DIR . 'includes/class-post-types.php';
require_once PREMIER_DEV_DIR . 'includes/class-fields.php';
require_once PREMIER_DEV_DIR . 'includes/class-data.php';
require_once PREMIER_DEV_DIR . 'includes/class-render.php';
require_once PREMIER_DEV_DIR . 'includes/class-shortcodes.php';
require_once PREMIER_DEV_DIR . 'includes/class-outliner.php';
require_once PREMIER_DEV_DIR . 'includes/class-elementor.php';
require_once PREMIER_DEV_DIR . 'includes/class-demo.php';

Premier_Post_Types::init();
Premier_Fields::init();
Premier_Shortcodes::init();
Premier_Outliner::init();
Premier_Elementor::init();
Premier_Demo::init();

/**
 * Front-end script for the interactive site plan, plot links and lightbox.
 * Registered here and enqueued only when a component that needs it is printed.
 */
add_action( 'wp_enqueue_scripts', function () {
	wp_register_script(
		'premier-site-plan',
		PREMIER_DEV_URL . 'assets/js/site-plan.js',
		array(),
		PREMIER_DEV_VERSION . '.' . (int) @filemtime( PREMIER_DEV_DIR . 'assets/js/site-plan.js' ),
		true
	);
} );

register_activation_hook( __FILE__, function () {
	Premier_Post_Types::register();
	flush_rewrite_rules();
} );

register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );

/** Warn in the admin when ACF Pro (or Secure Custom Fields) is missing. */
add_action( 'admin_notices', function () {
	if ( function_exists( 'acf_add_local_field_group' ) && class_exists( 'acf_field_repeater' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p><strong>Premier Developments</strong> needs <strong>ACF Pro</strong> (or the free Secure Custom Fields plugin) to edit developments, house types and plots.</p></div>';
} );
