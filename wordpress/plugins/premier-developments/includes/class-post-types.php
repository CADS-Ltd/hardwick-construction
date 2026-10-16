<?php
/**
 * Developments and House Types, plus the /plots/ page on each development.
 */

defined( 'ABSPATH' ) || exit;

class Premier_Post_Types {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ) );
		add_action( 'acf/save_post', array( __CLASS__, 'house_type_slug' ), 20 );
		add_filter( 'manage_development_posts_columns', array( __CLASS__, 'development_columns' ) );
		add_action( 'manage_development_posts_custom_column', array( __CLASS__, 'development_column' ), 10, 2 );
		add_filter( 'manage_house_type_posts_columns', array( __CLASS__, 'house_type_columns' ) );
		add_action( 'manage_house_type_posts_custom_column', array( __CLASS__, 'house_type_column' ), 10, 2 );
		add_action( 'restrict_manage_posts', array( __CLASS__, 'house_type_filter' ) );
		add_action( 'template_redirect', array( __CLASS__, 'plots_without_plan' ) );
		add_action( 'template_redirect', array( __CLASS__, 'archive_to_page' ) );
		add_action( 'acf/save_post', array( __CLASS__, 'clear_page_cache' ), 99 );
		add_action( 'trashed_post', array( __CLASS__, 'clear_page_cache' ) );
		add_action( 'pre_get_posts', array( __CLASS__, 'house_type_filter_query' ) );
		add_filter( 'wp_get_nav_menu_items', array( __CLASS__, 'hide_completed_links' ) );
		add_action( 'acf/save_post', array( __CLASS__, 'sync_form_choices' ), 99 );
		add_action( 'trashed_post', array( __CLASS__, 'sync_form_choices' ) );
		add_action( 'untrashed_post', array( __CLASS__, 'sync_form_choices' ) );
	}

	/**
	 * The enquiry form's "Which development are you interested in?" list follows
	 * the current developments: adding, renaming, completing or binning one
	 * updates it. Choices added by hand in WPForms (such as "General enquiry")
	 * are kept, after the developments.
	 */
	public static function sync_form_choices( $post_id = 0 ) {
		if ( $post_id && 'development' !== get_post_type( $post_id ) ) {
			return;
		}
		$form_id  = Premier_Data::contact_form_id();
		$field_id = (int) get_option( 'premier_contact_form_dev_field' );
		if ( ! $form_id || ! $field_id || ! function_exists( 'wpforms' ) ) {
			return;
		}
		$form = wpforms()->obj( 'form' )->get( $form_id );
		$data = $form ? wpforms_decode( $form->post_content ) : null;
		if ( empty( $data['fields'][ $field_id ]['choices'] ) ) {
			return;
		}
		$names   = array_column( Premier_Data::developments( 'current' ), 'name' );
		// Names this added last time; before the first sync, everything but "General enquiry" came from the demo
		$managed = get_option( 'premier_form_dev_choices', null );
		$others  = array();
		foreach ( $data['fields'][ $field_id ]['choices'] as $choice ) {
			$label = (string) ( $choice['label'] ?? '' );
			$auto  = is_array( $managed ) ? in_array( $label, $managed, true ) : 'General enquiry' !== $label;
			if ( '' !== $label && ! $auto && ! in_array( $label, $names, true ) ) {
				$others[] = $label;
			}
		}
		$choices = array();
		foreach ( array_merge( $names, $others ) as $i => $label ) {
			$choices[ $i + 1 ] = array( 'label' => $label, 'value' => '', 'image' => '' );
		}
		update_option( 'premier_form_dev_choices', $names, false );
		if ( array_column( $choices, 'label' ) !== array_column( $data['fields'][ $field_id ]['choices'], 'label' ) ) {
			$data['fields'][ $field_id ]['choices'] = $choices;
			wpforms()->obj( 'form' )->update( $form_id, $data );
		}
	}

	/**
	 * Until a development is marked completed, menu links to the Completed
	 * developments page (or the home page's #completed section) are left out.
	 * They come back by themselves once one is published.
	 */
	public static function hide_completed_links( $items ) {
		if ( is_admin() || ! is_array( $items ) || Premier_Data::developments( 'completed' ) ) {
			return $items;
		}
		$page = Premier_Data::page_id( 'completed' );
		return array_values( array_filter( $items, function ( $item ) use ( $page ) {
			$to_page = $page && 'post_type' === $item->type && (int) $item->object_id === $page;
			return ! $to_page && '#completed' !== strstr( (string) $item->url, '#' );
		} ) );
	}

	public static function register() {
		register_post_type( 'development', array(
			'labels'        => array(
				'name'          => 'Developments',
				'singular_name' => 'Development',
				'add_new_item'  => 'Add new development',
				'edit_item'     => 'Edit development',
				'all_items'     => 'All developments',
				'menu_name'     => 'Developments',
			),
			'public'        => true,
			'has_archive'   => 'developments',
			'rewrite'       => array( 'slug' => 'developments', 'with_front' => false, 'ep_mask' => EP_PERMALINK ),
			'menu_icon'     => 'dashicons-admin-multisite',
			'menu_position' => 5,
			'supports'      => array( 'title', 'page-attributes' ),
			'show_in_rest'  => true,
		) );

		register_post_type( 'house_type', array(
			'labels'        => array(
				'name'          => 'House types',
				'singular_name' => 'House type',
				'add_new_item'  => 'Add new house type',
				'edit_item'     => 'Edit house type',
				'all_items'     => 'House types',
				'menu_name'     => 'House types',
			),
			'public'        => true,
			'has_archive'   => false,
			'rewrite'       => array( 'slug' => 'house-types', 'with_front' => false ),
			'show_in_menu'  => 'edit.php?post_type=development',
			'supports'      => array( 'title', 'page-attributes' ),
			'show_in_rest'  => true,
		) );

		// /developments/brunt-lane/plots/ — the interactive site plan page
		add_rewrite_endpoint( 'plots', EP_PERMALINK );
	}

	/** True when viewing a development's /plots/ page. */
	public static function is_plots_page() {
		global $wp_query;
		return is_singular( 'development' ) && isset( $wp_query->query_vars['plots'] );
	}

	/**
	 * A /plots/ page only exists when the development has a site plan and the
	 * theme shows plots on their own page; otherwise go to the development.
	 */
	public static function plots_without_plan() {
		if ( ! self::is_plots_page() ) {
			return;
		}
		$id = get_queried_object_id();
		if ( Premier_Data::plots_inline() && Premier_Data::field( 'site_plan', $id ) ) {
			wp_safe_redirect( get_permalink( $id ) . '#homes', 301 );
			exit;
		}
		if ( ! Premier_Data::field( 'site_plan', $id ) ) {
			wp_safe_redirect( get_permalink( $id ), 302 );
			exit;
		}
	}

	/**
	 * Once there is a Current developments page, the /developments/ archive
	 * would only duplicate it, so it points there instead.
	 */
	public static function archive_to_page() {
		if ( ! is_post_type_archive( 'development' ) || is_feed() ) {
			return;
		}
		$page = Premier_Data::page_url( 'current' );
		if ( $page ) {
			wp_safe_redirect( $page, 301 );
			exit;
		}
	}

	/**
	 * A plot's price or status shows on many pages (the development, its house
	 * types, the Current and Completed pages, the home page), so after saving a
	 * development or house type the whole WP Rocket cache is cleared. Its preload
	 * then rebuilds the pages in the background.
	 */
	public static function clear_page_cache( $post_id ) {
		if ( ! in_array( get_post_type( $post_id ), array( 'development', 'house_type' ), true ) || wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( function_exists( 'rocket_clean_domain' ) ) {
			rocket_clean_domain();
		}
	}

	/**
	 * Give each house type a URL that includes its development, e.g.
	 * /house-types/brunt-lane-type-a/, so "Type A" can be reused on every site.
	 */
	public static function house_type_slug( $post_id ) {
		if ( get_post_type( $post_id ) !== 'house_type' || wp_is_post_revision( $post_id ) ) {
			return;
		}
		$dev = Premier_Data::field( 'development', $post_id, false );
		if ( ! $dev ) {
			return;
		}
		$want = sanitize_title( get_post_field( 'post_name', $dev ) . '-' . get_the_title( $post_id ) );
		if ( get_post_field( 'post_name', $post_id ) !== $want ) {
			remove_action( 'acf/save_post', array( __CLASS__, 'house_type_slug' ), 20 );
			wp_update_post( array( 'ID' => $post_id, 'post_name' => $want ) );
			add_action( 'acf/save_post', array( __CLASS__, 'house_type_slug' ), 20 );
		}
	}

	/* ----- Admin list columns ----- */

	public static function development_columns( $cols ) {
		$new = array();
		foreach ( $cols as $k => $v ) {
			$new[ $k ] = $v;
			if ( 'title' === $k ) {
				$new['premier_stage'] = 'Stage';
				$new['premier_plots'] = 'Plots';
			}
		}
		unset( $new['date'] );
		return $new;
	}

	public static function development_column( $col, $post_id ) {
		if ( 'premier_stage' === $col ) {
			$stage = Premier_Data::field( 'stage', $post_id );
			echo 'completed' === $stage
				? esc_html( 'Completed ' . Premier_Data::field( 'completed_year', $post_id ) )
				: 'Current';
		}
		if ( 'premier_plots' === $col ) {
			$d = Premier_Data::development( $post_id );
			if ( $d && $d['plots'] ) {
				$c = $d['counts'];
				printf(
					'%d plots — <strong>%d available</strong>, %d reserved, %d sold',
					(int) $c['total'], (int) $c['available'], (int) $c['reserved'], (int) $c['sold']
				);
			} else {
				echo '—';
			}
		}
	}

	public static function house_type_columns( $cols ) {
		$new = array();
		foreach ( $cols as $k => $v ) {
			$new[ $k ] = $v;
			if ( 'title' === $k ) {
				$new['premier_dev'] = 'Development';
			}
		}
		unset( $new['date'] );
		return $new;
	}

	public static function house_type_column( $col, $post_id ) {
		if ( 'premier_dev' === $col ) {
			$dev = Premier_Data::field( 'development', $post_id, false );
			echo $dev ? '<a href="' . esc_url( get_edit_post_link( $dev ) ) . '">' . esc_html( get_the_title( $dev ) ) . '</a>' : '—';
		}
	}

	/** "All developments" dropdown above the house types list. */
	public static function house_type_filter( $post_type ) {
		if ( 'house_type' !== $post_type ) {
			return;
		}
		$current = isset( $_GET['premier_dev'] ) ? absint( $_GET['premier_dev'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification
		echo '<select name="premier_dev"><option value="">All developments</option>';
		foreach ( get_posts( array( 'post_type' => 'development', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) ) as $dev ) {
			printf( '<option value="%d"%s>%s</option>', $dev->ID, selected( $current, $dev->ID, false ), esc_html( $dev->post_title ) );
		}
		echo '</select>';
	}

	public static function house_type_filter_query( $q ) {
		if ( ! is_admin() || ! $q->is_main_query() || 'house_type' !== $q->get( 'post_type' ) || empty( $_GET['premier_dev'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$q->set( 'meta_query', array( array( 'key' => 'development', 'value' => absint( $_GET['premier_dev'] ) ) ) ); // phpcs:ignore WordPress.Security.NonceVerification
	}
}
