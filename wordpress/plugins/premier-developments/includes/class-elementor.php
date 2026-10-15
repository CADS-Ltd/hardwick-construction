<?php
/**
 * Elementor integration: a "Premier Property" widget category with the home
 * page sections (hero, intro, developments, about, contact) and the
 * development components (site plan, plot table, house types, plots banner).
 */

defined( 'ABSPATH' ) || exit;

class Premier_Elementor {

	public static function init() {
		add_action( 'elementor/elements/categories_registered', array( __CLASS__, 'category' ) );
		add_action( 'elementor/widgets/register', array( __CLASS__, 'widgets' ) );
	}

	public static function category( $manager ) {
		$manager->add_category( 'premier', array(
			'title' => 'Premier Property',
			'icon'  => 'eicon-home',
		) );
	}

	public static function widgets( $manager ) {
		require_once PREMIER_DEV_DIR . 'includes/widgets/widgets.php';
		foreach ( array(
			'Premier_Widget_Hero',
			'Premier_Widget_Intro',
			'Premier_Widget_Developments',
			'Premier_Widget_About',
			'Premier_Widget_Contact',
			'Premier_Widget_Site_Plan',
			'Premier_Widget_Plots',
			'Premier_Widget_House_Types',
			'Premier_Widget_Plots_Banner',
		) as $class ) {
			$manager->register( new $class() );
		}
	}

	/** Options for a "Development" dropdown: this page, or a specific development. */
	public static function development_options() {
		$opts = array( '' => '— This page’s development —' );
		foreach ( get_posts( array( 'post_type' => 'development', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) as $p ) {
			$opts[ (string) $p->ID ] = $p->post_title;
		}
		return $opts;
	}
}
