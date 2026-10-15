<?php
/**
 * ACF setup: field groups live as JSON in /acf-json so they are version-controlled,
 * plus the "Company details" options page and a few editing conveniences.
 */

defined( 'ABSPATH' ) || exit;

class Premier_Fields {

	const JSON_DIR = 'acf-json';

	public static function init() {
		add_filter( 'acf/settings/load_json', array( __CLASS__, 'load_json' ) );
		add_filter( 'acf/json/save_paths', array( __CLASS__, 'save_paths' ), 10, 2 );
		add_action( 'acf/init', array( __CLASS__, 'options_page' ) );
		add_filter( 'acf/fields/post_object/query/key=field_premier_plot_house_type', array( __CLASS__, 'house_types_for_this_development' ), 10, 3 );
	}

	public static function load_json( $paths ) {
		$paths[] = PREMIER_DEV_DIR . self::JSON_DIR;
		return $paths;
	}

	/** Changes made to our field groups in the ACF admin are saved back into the plugin. */
	public static function save_paths( $paths, $post ) {
		if ( isset( $post['key'] ) && str_starts_with( $post['key'], 'group_premier_' ) ) {
			return array( PREMIER_DEV_DIR . self::JSON_DIR );
		}
		return $paths;
	}

	public static function options_page() {
		if ( ! function_exists( 'acf_add_options_page' ) ) {
			return;
		}
		acf_add_options_page( array(
			'page_title' => 'Company details',
			'menu_title' => 'Company details',
			'menu_slug'  => 'premier-company',
			'capability' => 'edit_pages',
			'icon_url'   => 'dashicons-building',
			'position'   => 6,
			'redirect'   => false,
		) );
	}

	/** In the plots table, only offer the house types that belong to this development. */
	public static function house_types_for_this_development( $args, $field, $post_id ) {
		if ( $post_id && get_post_type( $post_id ) === 'development' ) {
			$args['meta_query'] = array( array( 'key' => 'development', 'value' => (int) $post_id ) );
		}
		$args['orderby'] = 'title';
		$args['order']   = 'ASC';
		return $args;
	}
}
