<?php
/**
 * SEO with Rank Math (free or Pro).
 *
 * Automatic, so every new development and house type is optimised without extra work:
 *  - Title and description variables (%premier_seo_title%, %premier_seo_description%, %premier_location%)
 *    used by the Developments and House types title templates.
 *  - Focus keyword and social share image filled in from the ACF fields when left empty.
 *  - Structured data: developments as Residence, house types as SingleFamilyResidence.
 *  - House types with no picture and no floor plans are kept out of search (thin pages).
 *
 * One-off: Tools › Premier demo content › Apply SEO settings (or `wp premier seo`) sets up
 * Rank Math: business details and local SEO, title templates, sitemaps, social defaults,
 * breadcrumbs schema and the titles and descriptions of the main pages.
 */

defined( 'ABSPATH' ) || exit;

class Premier_SEO {

	public static function init() {
		add_action( 'rank_math/vars/register_extra_replacements', array( __CLASS__, 'variables' ) );
		add_filter( 'rank_math/json_ld', array( __CLASS__, 'json_ld' ), 99, 2 );
		add_filter( 'rank_math/frontend/robots', array( __CLASS__, 'robots' ) );
		add_filter( 'rank_math/sitemap/entry', array( __CLASS__, 'sitemap_entry' ), 10, 3 );
		add_filter( 'rank_math/sitemap/post_type_archive_link', array( __CLASS__, 'sitemap_archive' ), 10, 2 );
		add_filter( 'rank_math/frontend/breadcrumb/items', array( __CLASS__, 'breadcrumbs' ) );
		// Pages without a schema type of their own still say which website and business they belong to
		add_filter( 'rank_math/schema/add_global_entities', '__return_true' );
		add_action( 'acf/save_post', array( __CLASS__, 'fill_post_meta' ), 30 );
		add_action( 'acf/save_post', array( __CLASS__, 'remember_email' ), 5 );
		add_action( 'acf/save_post', array( __CLASS__, 'sync_company' ), 30 );
		add_action( 'admin_post_premier_seo', array( __CLASS__, 'handle' ) );
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			WP_CLI::add_command( 'premier seo', array( __CLASS__, 'cli' ) );
		}
	}

	public static function active() {
		return class_exists( 'RankMath' ) || defined( 'RANK_MATH_VERSION' );
	}

	/* ------------------------------------------------------------------
	 * Words used in titles, descriptions and keywords
	 * ------------------------------------------------------------------ */

	/** "Woodville, Swadlincote" → "Woodville" */
	private static function town( $location ) {
		return trim( explode( ',', (string) $location )[0] );
	}

	private static function post_from( $args ) {
		if ( is_object( $args ) && ! empty( $args->ID ) ) {
			return (int) $args->ID;
		}
		return (int) get_queried_object_id() ?: (int) get_the_ID();
	}

	/** Development data for a development or a house type. */
	private static function dev_for( $id ) {
		$type = get_post_type( $id );
		if ( 'development' === $type ) {
			return Premier_Data::development( $id );
		}
		if ( 'house_type' === $type ) {
			$dev = (int) Premier_Data::field( 'development', $id, false );
			return $dev ? Premier_Data::development( $dev ) : null;
		}
		return null;
	}

	private static function clip( $text, $max = 158 ) {
		$text = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( (string) $text ) ) );
		if ( mb_strlen( $text ) <= $max ) {
			return $text;
		}
		$cut = mb_substr( $text, 0, $max - 1 );
		return rtrim( mb_substr( $cut, 0, (int) mb_strrpos( $cut, ' ' ) ), ' ,.;:–-' ) . '…';
	}

	/** Titles stay within the 60 characters search results show. */
	const TITLE_MAX = 60;

	/** The shortest of the candidates that fits is used when none of the longer ones do. */
	private static function fit( $candidates ) {
		foreach ( $candidates as $title ) {
			if ( mb_strlen( $title ) <= self::TITLE_MAX ) {
				return $title;
			}
		}
		return end( $candidates );
	}

	/**
	 * "Brunt Lane, Woodville – New 4 Bed Homes for Sale". With $brand the
	 * company name is added after the separator when the whole title still fits.
	 */
	public static function seo_title( $id, $brand = false ) {
		$type  = get_post_type( $id );
		$title = get_the_title( $id );
		if ( 'development' === $type ) {
			$d = Premier_Data::development( $id );
			if ( $d ) {
				$where = self::town( $d['location'] );
				$beds  = $d['bed_range'] ? ucwords( $d['bed_range'] ) . ' ' : '';
				$title = 'completed' === $d['stage']
					? self::fit( array( $d['name'] . ', ' . $where . ' – Completed Development', $d['name'] . ', ' . $where . ' – Completed', $d['name'] . ' – Completed' ) )
					: self::fit( array( $d['name'] . ', ' . $where . ' – New ' . $beds . 'Homes for Sale', $d['name'] . ', ' . $where . ' – New ' . $beds . 'Homes', $d['name'] . ' – New Homes for Sale' ) );
			}
		} elseif ( 'house_type' === $type ) {
			$t = Premier_Data::house_type( $id );
			$d = self::dev_for( $id );
			$kind  = ( $t['beds'] ? $t['beds'] . ' Bedroom ' : '' ) . 'New Home';
			$title = self::fit( array( $t['name'] . ( $d ? ', ' . $d['name'] : '' ) . ' – ' . $kind, $t['name'] . ' – ' . $kind ) );
		}
		if ( $brand ) {
			$sep  = function_exists( 'rank_math_get_settings' ) ? (string) rank_math_get_settings( 'titles.title_separator', '|' ) : '|';
			$full = $title . ' ' . $sep . ' ' . get_bloginfo( 'name' );
			if ( mb_strlen( $full ) <= self::TITLE_MAX ) {
				$title = $full;
			}
		}
		return $title;
	}

	public static function seo_description( $id ) {
		$type = get_post_type( $id );
		if ( 'development' === $type ) {
			$d = Premier_Data::development( $id );
			if ( ! $d ) {
				return '';
			}
			if ( 'completed' === $d['stage'] ) {
				return self::clip( $d['name'] . ' in ' . $d['location'] . ', completed ' . $d['completed'] . ' by ' . Premier_Data::company()['name'] . '. ' . $d['summary'] );
			}
			$lead = 'New homes for sale at ' . $d['name'] . ', ' . $d['location'] . '.';
			if ( $d['bed_range'] || $d['price_from'] ) {
				$lead .= ' ' . ucfirst( trim( ( $d['bed_range'] ? $d['bed_range'] . ' homes' : 'Homes' ) . ( $d['price_from'] ? ' from ' . Premier_Data::price( $d['price_from'] ) : '' ) ) );
				$lead .= $d['counts']['available'] ? ', ' . $d['counts']['available'] . ' available now.' : '.';
			}
			return self::clip( $lead . ' ' . ( $d['site_plan'] ? 'View the site plan, house types and availability.' : $d['summary'] ) );
		}
		if ( 'house_type' === $type ) {
			$t = Premier_Data::house_type( $id );
			$d = self::dev_for( $id );
			$text = $t['name'] . ( $d ? ' at ' . $d['name'] . ', ' . $d['location'] : '' ) . ': ' . ( $t['style'] ?: $t['beds'] . ' bedroom home' );
			if ( $t['sqm'] ) {
				$text .= ', approx. ' . rtrim( rtrim( number_format( $t['sqm'], 1 ), '0' ), '.' ) . ' m²';
			}
			$text .= '. ' . ( $t['plans'] ? 'Floor plans, room sizes and availability.' : $t['summary'] );
			return self::clip( $text );
		}
		return '';
	}

	public static function focus_keyword( $id ) {
		$d = self::dev_for( $id );
		if ( ! $d ) {
			return '';
		}
		$where = strtolower( self::town( $d['location'] ) );
		if ( 'house_type' === get_post_type( $id ) ) {
			$t = Premier_Data::house_type( $id );
			return strtolower( ( $t['beds'] ? $t['beds'] . ' bedroom ' : '' ) . 'new home ' . $where ) . ',' . strtolower( $d['name'] );
		}
		return 'completed' === $d['stage'] ? strtolower( $d['name'] . ' ' . $where ) : 'new homes ' . $where . ',' . strtolower( $d['name'] );
	}

	/* ------------------------------------------------------------------
	 * Rank Math variables
	 * ------------------------------------------------------------------ */

	public static function variables() {
		if ( ! function_exists( 'rank_math_register_var_replacement' ) ) {
			return;
		}
		rank_math_register_var_replacement( 'premier_seo_title', array(
			'name'        => 'Premier: SEO title',
			'description' => 'Development or house type title with its location, bedrooms and status, plus the site name when it fits in 60 characters.',
			'variable'    => 'premier_seo_title',
			'example'     => 'Brunt Lane, Woodville – New 4 Bed Homes for Sale',
		), fn( $var_args, $args = null ) => self::seo_title( self::post_from( $args ), true ) );
		rank_math_register_var_replacement( 'premier_seo_description', array(
			'name'        => 'Premier: SEO description',
			'description' => 'Written from the development or house type details.',
			'variable'    => 'premier_seo_description',
			'example'     => 'New homes for sale at Brunt Lane, Woodville, Swadlincote: 13 4 bed homes, from £339,995.',
		), fn( $var_args, $args = null ) => self::seo_description( self::post_from( $args ) ) );
		rank_math_register_var_replacement( 'premier_location', array(
			'name'        => 'Premier: development location',
			'description' => 'Location of the development (or of a house type’s development).',
			'variable'    => 'premier_location',
			'example'     => 'Woodville, Swadlincote',
		), function ( $var_args, $args = null ) {
			$d = self::dev_for( self::post_from( $args ) );
			return $d ? $d['location'] : '';
		} );
	}

	/* ------------------------------------------------------------------
	 * Focus keyword and social image, filled in when left empty
	 * ------------------------------------------------------------------ */

	public static function fill_post_meta( $post_id ) {
		$type = get_post_type( $post_id );
		if ( ! in_array( $type, array( 'development', 'house_type' ), true ) || wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( ! get_post_meta( $post_id, 'rank_math_focus_keyword', true ) ) {
			$kw = self::focus_keyword( $post_id );
			if ( $kw ) {
				update_post_meta( $post_id, 'rank_math_focus_keyword', $kw );
			}
		}
		// Social image: the main photo (development) or the picture of the house (house type),
		// kept in step until someone chooses a different one in Rank Math.
		$auto  = get_post_meta( $post_id, '_premier_og_auto', true );
		$img   = 'development' === $type ? (int) Premier_Data::field( 'hero_image', $post_id ) : (int) Premier_Data::field( 'image', $post_id );
		$set   = (int) get_post_meta( $post_id, 'rank_math_facebook_image_id', true );
		if ( $img && ( ! $set || $auto ) ) {
			$url = wp_get_attachment_image_url( $img, 'full' );
			foreach ( array( 'facebook', 'twitter' ) as $net ) {
				update_post_meta( $post_id, 'rank_math_' . $net . '_image', $url );
				update_post_meta( $post_id, 'rank_math_' . $net . '_image_id', $img );
			}
			update_post_meta( $post_id, '_premier_og_auto', 1 );
		}
	}

	/* ------------------------------------------------------------------
	 * Thin house types (no picture and no floor plans) stay out of search
	 * ------------------------------------------------------------------ */

	private static function is_thin_house_type( $id ) {
		if ( get_post_type( $id ) !== 'house_type' ) {
			return false;
		}
		$t = Premier_Data::house_type( $id );
		return $t && ! $t['image'] && ! $t['plans'] && ! $t['pdf'];
	}

	public static function robots( $robots ) {
		if ( is_singular( 'house_type' ) && self::is_thin_house_type( get_queried_object_id() ) ) {
			$robots['index'] = 'noindex';
		}
		return $robots;
	}

	/** Returning false removes the entry from the sitemap. */
	public static function sitemap_entry( $url, $type, $object ) {
		if ( 'post' === $type && is_object( $object ) && self::is_thin_house_type( $object->ID ) ) {
			return false;
		}
		return $url;
	}

	/** The developments archive redirects to the Current developments page, so it is left out. */
	public static function sitemap_archive( $link, $post_type ) {
		return 'development' === $post_type && Premier_Data::page_url( 'current' ) ? false : $link;
	}

	/** Breadcrumbs lead to the Current or Completed developments page rather than the archive. */
	public static function breadcrumbs( $crumbs ) {
		$archive = get_post_type_archive_link( 'development' );
		$d       = is_singular( array( 'development', 'house_type' ) ) ? self::dev_for( get_queried_object_id() ) : null;
		$role    = $d && 'completed' === $d['stage'] ? 'completed' : 'current';
		$page    = Premier_Data::page_id( $role );
		foreach ( (array) $crumbs as $i => $crumb ) {
			if ( $page && $archive && isset( $crumb[1] ) && untrailingslashit( $crumb[1] ) === untrailingslashit( $archive ) ) {
				$crumbs[ $i ][0] = get_the_title( $page );
				$crumbs[ $i ][1] = get_permalink( $page );
			}
		}
		return $crumbs;
	}

	/* ------------------------------------------------------------------
	 * Structured data
	 * ------------------------------------------------------------------ */

	private static function address( $d ) {
		$parts = array_map( 'trim', explode( ',', $d['location'] ) );
		$addr  = array(
			'@type'           => 'PostalAddress',
			'streetAddress'   => $d['name'],
			'addressLocality' => $parts[0],
			'addressCountry'  => 'GB',
		);
		if ( ! empty( $parts[1] ) ) {
			$addr['addressRegion'] = $parts[1];
		}
		if ( $d['postcode'] ) {
			$addr['postalCode'] = $d['postcode'];
		}
		return $addr;
	}

	public static function json_ld( $data, $jsonld = null ) {
		if ( is_singular( 'development' ) ) {
			$d = Premier_Data::development( get_queried_object_id() );
			if ( $d ) {
				$entity = array(
					'@type'       => 'Residence',
					'@id'         => $d['url'] . '#development',
					'name'        => $d['name'],
					'description' => self::seo_description( $d['id'] ),
					'url'         => $d['url'],
					'address'     => self::address( $d ),
				);
				if ( $d['hero'] ) {
					$entity['image'] = wp_get_attachment_image_url( $d['hero'], 'full' );
				}
				if ( $d['features'] ) {
					$entity['amenityFeature'] = array_map( fn( $f ) => array( '@type' => 'LocationFeatureSpecification', 'name' => $f, 'value' => true ), $d['features'] );
				}
				if ( $d['house_types'] ) {
					$entity['containsPlace'] = array_map( fn( $t ) => array( '@type' => 'SingleFamilyResidence', '@id' => $t['url'] . '#house-type', 'name' => $t['name'], 'url' => $t['url'] ), $d['house_types'] );
				}
				$data['premierDevelopment'] = $entity;
				if ( isset( $data['WebPage'] ) ) {
					$data['WebPage']['mainEntity'] = array( '@id' => $entity['@id'] );
				}
			}
		}
		foreach ( array( 'current', 'completed' ) as $role ) {
			$page = Premier_Data::page_id( $role );
			if ( $page && is_page( $page ) ) {
				$items = array();
				foreach ( Premier_Data::developments( $role ) as $i => $dev ) {
					$items[] = array( '@type' => 'ListItem', 'position' => $i + 1, 'url' => $dev['url'], 'name' => $dev['name'] );
				}
				if ( $items ) {
					$data['premierDevelopmentList'] = array(
						'@type'           => 'ItemList',
						'name'            => 'completed' === $role ? 'Completed developments' : 'Current developments',
						'itemListElement' => $items,
					);
				}
			}
		}
		if ( is_singular( 'house_type' ) ) {
			$t = Premier_Data::house_type( get_queried_object_id() );
			$d = $t ? self::dev_for( $t['id'] ) : null;
			if ( $t ) {
				$entity = array(
					'@type'       => 'SingleFamilyResidence',
					'@id'         => $t['url'] . '#house-type',
					'name'        => $t['name'] . ( $d ? ', ' . $d['name'] : '' ),
					'description' => self::seo_description( $t['id'] ),
					'url'         => $t['url'],
				);
				if ( $t['beds'] ) {
					$entity['numberOfBedrooms'] = $t['beds'];
					$entity['numberOfRooms']    = $t['beds'];
				}
				if ( $t['sqm'] ) {
					$entity['floorSize'] = array( '@type' => 'QuantitativeValue', 'value' => $t['sqm'], 'unitCode' => 'MTK' );
				}
				if ( $t['image'] ) {
					$entity['image'] = wp_get_attachment_image_url( $t['image'], 'full' );
				}
				if ( $d ) {
					$entity['address']         = self::address( $d );
					$entity['containedInPlace'] = array( '@id' => $d['url'] . '#development', '@type' => 'Residence', 'name' => $d['name'] );
				}
				$data['premierHouseType'] = $entity;
				if ( isset( $data['WebPage'] ) ) {
					$data['WebPage']['mainEntity'] = array( '@id' => $entity['@id'] );
				}
			}
		}
		return $data;
	}

	/* ------------------------------------------------------------------
	 * One-off Rank Math set-up
	 * ------------------------------------------------------------------ */

	public static function handle() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'premier_seo' );
		set_transient( 'premier_seo_log', self::setup(), 60 );
		wp_safe_redirect( admin_url( 'tools.php?page=premier-demo&seo=1' ) );
		exit;
	}

	/** Apply the Rank Math settings for Premier Property Central. */
	public static function cli() {
		foreach ( self::setup() as $line ) {
			WP_CLI::log( $line );
		}
		WP_CLI::success( 'SEO settings applied.' );
	}

	private static function merge_option( $name, $values ) {
		$current = get_option( $name, array() );
		update_option( $name, array_merge( is_array( $current ) ? $current : array(), $values ) );
	}

	/** Page titles set by earlier versions (over 60 characters once the site name is added). */
	const OLD_TITLES = array(
		'',
		'New Homes in Swadlincote & South Derbyshire %sep% %sitename%',
		'New Homes for Sale in South Derbyshire %sep% %sitename%',
		'About Us – Housebuilder in Swadlincote %sep% %sitename%',
	);

	/** Rank Math's business email, phone and address, from Company details. */
	private static function business_contact( $c ) {
		$addr = array();
		if ( $c['address'] ) {
			$lines = $c['address'];
			$addr  = array(
				'streetAddress'   => implode( ', ', array_slice( $lines, 0, max( 1, count( $lines ) - 3 ) ) ),
				'addressLocality' => $lines[ count( $lines ) - 3 ] ?? '',
				'addressRegion'   => $lines[ count( $lines ) - 2 ] ?? '',
				'postalCode'      => $lines[ count( $lines ) - 1 ] ?? '',
				'addressCountry'  => 'GB',
			);
		}
		return array(
			'email'         => $c['email'],
			'phone'         => $c['phone'],
			'local_address' => $addr,
			'phone_numbers' => $c['phone'] ? array( array( 'type' => 'sales', 'number' => $c['phone'] ) ) : array(),
		);
	}

	/** The email address saved in Company details before this save, so enquiries can follow it. */
	private static $old_email = '';

	public static function remember_email( $post_id ) {
		if ( 'options' === $post_id ) {
			self::$old_email = (string) Premier_Data::field( 'email', 'option' );
		}
	}

	/**
	 * Company details are the one place the client edits their contact details:
	 * keep Google's business details (Rank Math) and the enquiry form's
	 * recipient in step with them.
	 */
	public static function sync_company( $post_id ) {
		if ( 'options' !== $post_id ) {
			return;
		}
		Premier_Data::forget( 'company' );
		$c = Premier_Data::company();
		if ( self::active() ) {
			self::merge_option( 'rank-math-options-titles', self::business_contact( $c ) );
		}
		$form_id = Premier_Data::contact_form_id();
		$old     = self::$old_email;
		if ( ! $form_id || ! $c['email'] || ! $old || $old === $c['email'] || ! function_exists( 'wpforms' ) ) {
			return;
		}
		$form = wpforms()->obj( 'form' )->get( $form_id );
		$data = $form ? wpforms_decode( $form->post_content ) : null;
		if ( empty( $data['settings']['notifications'] ) ) {
			return;
		}
		$changed = false;
		foreach ( $data['settings']['notifications'] as $i => $n ) {
			// Only a recipient still pointing at the old address is changed
			if ( isset( $n['email'] ) && str_contains( $n['email'], $old ) ) {
				$data['settings']['notifications'][ $i ]['email'] = str_replace( $old, $c['email'], $n['email'] );
				$changed = true;
			}
		}
		if ( $changed ) {
			wpforms()->obj( 'form' )->update( $form_id, $data );
		}
	}

	public static function setup() {
		$log = array();
		if ( ! self::active() ) {
			return array( 'Rank Math is not active.' );
		}
		$name = 'Premier Property Central';
		// The brand is "Premier Property Central" (logo and email domain); tidy older "(Central)" spellings
		if ( function_exists( 'update_field' ) && str_contains( (string) get_field( 'company_name', 'option' ), '(Central)' ) ) {
			update_field( 'company_name', $name, 'option' );
		}
		if ( str_contains( (string) get_option( 'blogname' ), '(Central)' ) ) {
			update_option( 'blogname', $name );
		}
		$c = Premier_Data::company();

		// Logo for search results and the business profile
		$logo_id = (int) get_theme_mod( 'custom_logo' );
		$logo    = $logo_id ? wp_get_attachment_image_url( $logo_id, 'full' ) : get_template_directory_uri() . '/assets/img/logo.png';

		// Default social image: the home page hero photo
		$home       = (int) get_option( 'page_on_front' );
		$og_default = self::page_header_image( $home );

		$titles = array(
			'title_separator'              => '|',
			'knowledgegraph_type'          => 'company',
			'knowledgegraph_name'          => $name,
			'website_name'                 => $name,
			'website_alternate_name'       => 'Premier Property',
			'organization_description'     => 'Premier Property Central builds quality new homes in Swadlincote and South Derbyshire.',
			'knowledgegraph_logo'          => $logo,
			'knowledgegraph_logo_id'       => $logo_id,
			'url'                          => home_url( '/' ),
			'local_business_type'          => 'HomeAndConstructionBusiness',
			'local_seo_about_page'         => Premier_Data::page_id( 'about' ),
			'local_seo_contact_page'       => Premier_Data::page_id( 'contact' ),
			'twitter_card_type'            => 'summary_large_image',
			// Developments and house types: titles and descriptions written from their details
			'pt_development_title'               => '%premier_seo_title%',
			'pt_development_description'         => '%premier_seo_description%',
			'pt_development_archive_title'       => 'Our Developments %page% %sep% %sitename%',
			'pt_development_archive_description' => 'Browse every development by ' . $name . ': new homes for sale in Swadlincote and South Derbyshire, and the developments we have completed.',
			'pt_development_default_rich_snippet' => 'off',
			'pt_development_robots'              => array( 'index' ),
			'pt_house_type_title'                => '%premier_seo_title%',
			'pt_house_type_description'          => '%premier_seo_description%',
			'pt_house_type_default_rich_snippet' => 'off',
			'pt_house_type_robots'               => array( 'index' ),
			'pt_page_title'                      => '%title% %sep% %sitename%',
			'pt_page_default_rich_snippet'       => 'off',
			// Template library and Elementor helper types are not pages for search engines
			'pt_elementor_library_robots'        => array( 'noindex' ),
			'pt_elementor_library_custom_robots' => 'on',
		);
		if ( $og_default ) {
			$titles['open_graph_image']    = wp_get_attachment_image_url( $og_default, 'full' );
			$titles['open_graph_image_id'] = $og_default;
		}
		self::merge_option( 'rank-math-options-titles', array_merge( $titles, self::business_contact( $c ) ) );
		$log[] = 'Business details, local SEO (Home & Construction Business) and title templates set.';

		self::merge_option( 'rank-math-options-sitemap', array(
			'pt_page_sitemap'               => 'on',
			'pt_development_sitemap'        => 'on',
			'pt_house_type_sitemap'         => 'on',
			'pt_post_sitemap'               => wp_count_posts( 'post' )->publish > 1 ? 'on' : 'off',
			'pt_attachment_sitemap'         => 'off',
			'pt_e-floating-buttons_sitemap' => 'off',
			'pt_elementor_library_sitemap'  => 'off',
			'tax_category_sitemap'          => 'off',
			'include_images'                => 'on',
		) );
		$log[] = 'Sitemap: pages, developments and house types.';

		self::merge_option( 'rank-math-options-general', array(
			'breadcrumbs'              => 'on',
			'breadcrumbs_home_label'   => 'Home',
			'attachment_redirect_urls' => 'on',
			'attachment_redirect_default' => home_url( '/' ),
		) );
		$log[] = 'Breadcrumb structured data on; media attachment pages redirect.';

		$modules = get_option( 'rank_math_modules', array() );
		foreach ( array( 'sitemap', 'rich-snippet', 'local-seo', 'seo-analysis', 'acf' ) as $m ) {
			if ( ! in_array( $m, (array) $modules, true ) ) {
				$modules[] = $m;
			}
		}
		update_option( 'rank_math_modules', array_values( $modules ) );

		// Main pages: titles, descriptions, keywords and share images (only where empty)
		$pages = array(
			$home => array(
				'%sitename% %sep% New Homes in South Derbyshire',
				$name . ' builds quality new homes in Swadlincote and South Derbyshire. Explore our developments, site plans, house types and homes for sale.',
				'new homes south derbyshire,new homes swadlincote,new build homes derbyshire',
			),
			Premier_Data::page_id( 'current' ) => array(
				'Current Developments %sep% New Homes in South Derbyshire',
				'Current developments by ' . $name . ': new homes for sale in Swadlincote and South Derbyshire, with site plans, prices and availability.',
				'new homes for sale south derbyshire,new build homes swadlincote',
			),
			Premier_Data::page_id( 'completed' ) => array(
				'Completed Developments %sep% %sitename%',
				'Developments completed by ' . $name . ' across Swadlincote and South Derbyshire, every home now sold.',
				'completed developments south derbyshire',
			),
			Premier_Data::page_id( 'about' ) => array(
				'About %sitename% %sep% Swadlincote Housebuilder',
				$name . ' is a housebuilder based in Swadlincote, Derbyshire, building quality new homes across South Derbyshire.',
				'housebuilder swadlincote,premier property central',
			),
			Premier_Data::page_id( 'contact' ) => array(
				'Contact Us %sep% %sitename%, Swadlincote',
				'Contact ' . $name . ' in Swadlincote' . ( $c['phone'] ? ': call ' . $c['phone'] : '' ) . ', email ' . $c['email'] . ' or send an enquiry about our new homes.',
				'contact premier property central',
			),
		);
		$n = 0;
		foreach ( $pages as $id => $meta ) {
			if ( ! $id ) {
				continue;
			}
			$n++;
			// Replace an empty title, or one of the longer titles earlier versions set
			if ( in_array( (string) get_post_meta( $id, 'rank_math_title', true ), self::OLD_TITLES, true ) ) {
				update_post_meta( $id, 'rank_math_title', $meta[0] );
			}
			if ( ! get_post_meta( $id, 'rank_math_description', true ) ) {
				update_post_meta( $id, 'rank_math_description', $meta[1] );
			}
			if ( ! get_post_meta( $id, 'rank_math_focus_keyword', true ) ) {
				update_post_meta( $id, 'rank_math_focus_keyword', $meta[2] );
			}
			$img = self::page_header_image( $id );
			if ( $img && ! get_post_meta( $id, 'rank_math_facebook_image_id', true ) ) {
				foreach ( array( 'facebook', 'twitter' ) as $net ) {
					update_post_meta( $id, 'rank_math_' . $net . '_image', wp_get_attachment_image_url( $img, 'full' ) );
					update_post_meta( $id, 'rank_math_' . $net . '_image_id', $img );
				}
			}
		}
		$log[] = $n . ' main pages given titles (up to 60 characters), descriptions, focus keywords and share images (your own edits kept).';

		$changed = self::update_headings();
		if ( $changed ) {
			$log[] = 'Clearer main headings on ' . $changed . ' page(s) (About us, Contact us).';
		}

		// Developments and house types: keywords and share images
		$count = 0;
		foreach ( get_posts( array( 'post_type' => array( 'development', 'house_type' ), 'numberposts' => -1, 'fields' => 'ids' ) ) as $id ) {
			self::fill_post_meta( $id );
			$count++;
		}
		$log[] = $count . ' developments and house types given focus keywords and share images.';

		// Rebuild the sitemap cache
		delete_transient( 'rank_math_sitemap_cache' );
		if ( class_exists( '\RankMath\Sitemap\Cache' ) ) {
			\RankMath\Sitemap\Cache::invalidate_storage();
		}
		flush_rewrite_rules( false );
		if ( '0' === (string) get_option( 'blog_public' ) ) {
			$log[] = 'Note: Settings › Reading › “Discourage search engines” is on, so nothing will be indexed until it is turned off.';
		}
		return $log;
	}

	/**
	 * Earlier versions gave the About and Contact pages headings that didn't
	 * say what the page was. Update them, unless they have been edited since.
	 */
	private static function update_headings() {
		$updates = array(
			'about'   => array(
				'premier-page-header' => array(
					'eyebrow' => array( 'About us', 'Housebuilders · Swadlincote' ),
					'title'   => array( 'A local name on every <em>home</em> we build', 'About Premier Property <em>Central</em>' ),
					'lede'    => array( '', 'A local housebuilder in Swadlincote, building quality new homes across South Derbyshire.' ),
				),
				'premier-intro'       => array(
					'heading' => array( 'Premier Property Central', 'A local name on every home we build' ),
				),
			),
			'contact' => array(
				'premier-page-header' => array(
					'eyebrow' => array( 'Contact us', 'Get in touch' ),
					'title'   => array( 'We would love to <em>hear</em> from you', 'Contact <em>us</em>' ),
					'lede'    => array( 'Ask about a development, arrange a viewing or register your interest in new homes.', 'We would love to hear from you. Ask about a development, arrange a viewing or register your interest in new homes.' ),
				),
			),
		);
		$pages = 0;
		foreach ( $updates as $role => $widgets ) {
			$id   = Premier_Data::page_id( $role );
			$data = $id ? json_decode( (string) get_post_meta( $id, '_elementor_data', true ), true ) : null;
			if ( ! is_array( $data ) ) {
				continue;
			}
			$changed = false;
			$walk    = function ( &$els ) use ( &$walk, $widgets, &$changed ) {
				foreach ( $els as &$el ) {
					$fields = $widgets[ $el['widgetType'] ?? '' ] ?? null;
					$guard  = isset( $fields['title'] ) ? 'title' : 'heading';
					// Only a widget still showing the old heading is touched
					if ( $fields && ( $el['settings'][ $guard ] ?? '' ) === $fields[ $guard ][0] ) {
						foreach ( $fields as $key => list( $old, $new ) ) {
							if ( ( $el['settings'][ $key ] ?? '' ) === $old ) {
								$el['settings'][ $key ] = $new;
								$changed                = true;
							}
						}
					}
					if ( ! empty( $el['elements'] ) ) {
						$walk( $el['elements'] );
					}
				}
			};
			$walk( $data );
			if ( $changed ) {
				update_post_meta( $id, '_elementor_data', wp_slash( wp_json_encode( $data ) ) );
				delete_post_meta( $id, '_elementor_element_cache' );
				delete_post_meta( $id, '_elementor_css' );
				$pages++;
			}
		}
		return $pages;
	}

	/** Background image of the first Page header / hero widget on an Elementor page. */
	private static function page_header_image( $id ) {
		if ( ! $id ) {
			return 0;
		}
		$data = json_decode( (string) get_post_meta( $id, '_elementor_data', true ), true );
		$find = function ( $els ) use ( &$find ) {
			foreach ( (array) $els as $el ) {
				if ( in_array( $el['widgetType'] ?? '', array( 'premier-hero', 'premier-page-header' ), true ) && ! empty( $el['settings']['image']['id'] ) ) {
					return (int) $el['settings']['image']['id'];
				}
				$found = $find( $el['elements'] ?? array() );
				if ( $found ) {
					return $found;
				}
			}
			return 0;
		};
		return $find( $data );
	}
}
