<?php
/**
 * Development page, or its /plots/ page.
 * An Elementor Pro "Single" template assigned to Developments replaces the main development page.
 */

defined( 'ABSPATH' ) || exit;

get_header();

if ( premier_requires_plugin() ) {
	$d = Premier_Data::development( get_queried_object_id() );
	if ( Premier_Post_Types::is_plots_page() && $d && $d['site_plan'] ) {
		get_template_part( 'template-parts/plots', null, array( 'd' => $d ) );
	} elseif ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'single' ) ) {
		get_template_part( 'template-parts/development', null, array( 'd' => $d ) );
	}
}

get_footer();
