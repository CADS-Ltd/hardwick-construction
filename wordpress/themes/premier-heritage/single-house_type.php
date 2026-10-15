<?php
/**
 * House type page. An Elementor Pro "Single" template assigned to House types replaces it.
 */

defined( 'ABSPATH' ) || exit;

get_header();

if ( premier_requires_plugin() && ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'single' ) ) ) {
	$t = Premier_Data::house_type( get_queried_object_id() );
	$d = $t && $t['development'] ? Premier_Data::development( $t['development'] ) : null;
	get_template_part( 'template-parts/house-type', null, array( 't' => $t, 'd' => $d ) );
}

get_footer();
