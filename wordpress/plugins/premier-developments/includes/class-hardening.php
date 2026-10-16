<?php
/**
 * Small site-wide safeguards:
 *  - Author pages, the public users list and embed data would show the
 *    admin's login name, so they are switched off or stripped.
 *  - Photos uploaded as JPEG get their resized copies saved as WebP (much
 *    smaller), when the server can make WebP images.
 */

defined( 'ABSPATH' ) || exit;

class Premier_Hardening {

	public static function init() {
		// Before WordPress's own redirect, which would reveal /author/<login>/ for ?author=1
		add_action( 'template_redirect', array( __CLASS__, 'author_pages' ), 1 );
		add_filter( 'rest_endpoints', array( __CLASS__, 'users_endpoint' ) );
		add_filter( 'oembed_response_data', array( __CLASS__, 'embed_data' ) );
		add_filter( 'rank_math/opengraph/slack_enhanced_data', array( __CLASS__, 'slack_data' ) );
		add_filter( 'image_editor_output_format', array( __CLASS__, 'webp' ) );
	}

	/** The site has no author pages: send them to the home page. */
	public static function author_pages() {
		if ( is_author() ) {
			wp_safe_redirect( home_url( '/' ), 301 );
			exit;
		}
	}

	/** Only logged-in users (the editor needs it) can list users through the REST API. */
	public static function users_endpoint( $endpoints ) {
		if ( ! is_user_logged_in() ) {
			unset( $endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
		}
		return $endpoints;
	}

	public static function embed_data( $data ) {
		unset( $data['author_name'], $data['author_url'] );
		return $data;
	}

	/** Rank Math's link preview for Slack shows "Written by <login>". */
	public static function slack_data( $data ) {
		unset( $data[ __( 'Written by', 'seo-by-rank-math' ) ] );
		return $data;
	}

	public static function webp( $formats ) {
		static $checking = false, $supported = null;
		if ( null === $supported ) {
			if ( $checking ) {
				return $formats;
			}
			$checking  = true;
			$supported = wp_image_editor_supports( array( 'mime_type' => 'image/webp' ) );
			$checking  = false;
		}
		if ( $supported && ! isset( $formats['image/jpeg'] ) ) {
			$formats['image/jpeg'] = 'image/webp';
		}
		return $formats;
	}
}
