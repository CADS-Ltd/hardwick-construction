<?php
/**
 * Shortcodes, for use anywhere (including Elementor's Shortcode widget):
 *
 *   [premier_developments stage="current" layout="rows"]   stage: current | completed | all, layout: rows | grid
 *   [premier_site_plan development="brunt-lane"]           interactive site plan
 *   [premier_plots development="brunt-lane"]               availability summary + plot table
 *   [premier_house_types development="brunt-lane"]         house type cards
 *   [premier_plots_banner development="brunt-lane"]        banner linking to the /plots/ page
 *   [premier_stats]                                        count-up stats from Company details
 *
 * "development" accepts a slug or ID. Leave it out on a development or house type page to use that one.
 */

defined( 'ABSPATH' ) || exit;

class Premier_Shortcodes {

	public static function init() {
		add_shortcode( 'premier_developments', array( __CLASS__, 'developments' ) );
		add_shortcode( 'premier_site_plan', array( __CLASS__, 'site_plan' ) );
		add_shortcode( 'premier_plots', array( __CLASS__, 'plots' ) );
		add_shortcode( 'premier_house_types', array( __CLASS__, 'house_types' ) );
		add_shortcode( 'premier_plots_banner', array( __CLASS__, 'banner' ) );
		add_shortcode( 'premier_stats', array( __CLASS__, 'stats' ) );
	}

	/** Find a development from a slug / ID, or from the page being viewed. */
	public static function resolve( $ref = '' ) {
		$id = 0;
		if ( $ref ) {
			if ( is_numeric( $ref ) ) {
				$id = (int) $ref;
			} else {
				$p  = get_page_by_path( sanitize_title( $ref ), OBJECT, 'development' );
				$id = $p ? $p->ID : 0;
			}
		} else {
			$current = get_the_ID();
			if ( get_post_type( $current ) === 'development' ) {
				$id = $current;
			} elseif ( get_post_type( $current ) === 'house_type' ) {
				$id = (int) Premier_Data::field( 'development', $current, false );
			}
		}
		return $id ? Premier_Data::development( $id ) : null;
	}

	public static function developments( $atts ) {
		$a     = shortcode_atts( array( 'stage' => 'current', 'layout' => '' ), $atts );
		$stage = in_array( $a['stage'], array( 'current', 'completed' ), true ) ? $a['stage'] : '';
		$list  = Premier_Data::developments( $stage );
		$rows  = $a['layout'] ? 'rows' === $a['layout'] : 'current' === $stage;
		return $rows ? Premier_Render::development_rows( $list ) : Premier_Render::development_grid( $list );
	}

	public static function site_plan( $atts ) {
		$d = self::resolve( shortcode_atts( array( 'development' => '' ), $atts )['development'] );
		return $d ? Premier_Render::site_plan( $d ) : '';
	}

	public static function plots( $atts ) {
		$d = self::resolve( shortcode_atts( array( 'development' => '' ), $atts )['development'] );
		return $d ? Premier_Render::availability( $d ) : '';
	}

	public static function house_types( $atts ) {
		$a = shortcode_atts( array( 'development' => '', 'show_on_plan' => 'no' ), $atts );
		$d = self::resolve( $a['development'] );
		return $d ? Premier_Render::house_type_cards( $d, array( 'show_on_plan' => 'yes' === $a['show_on_plan'] ) ) : '';
	}

	public static function banner( $atts ) {
		$d = self::resolve( shortcode_atts( array( 'development' => '' ), $atts )['development'] );
		return $d ? Premier_Render::plan_cta( $d ) : '';
	}

	public static function stats() {
		return Premier_Render::stats( Premier_Data::company()['stats'] );
	}
}
