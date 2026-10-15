<?php
/**
 * Demo content: the developments, Brunt Lane house types and plots from the
 * approved Heritage prototype, an Elementor home page and the menus.
 *
 * Run from Tools › Premier demo content, or with WP-CLI:
 *   wp premier demo [--source=<url or folder holding img/ and docs/>]
 *
 * Images and PDFs are downloaded from the published prototype
 * (https://cads-ltd.github.io/hardwick-construction/assets/). Safe to run
 * again: existing developments and house types are updated, not duplicated.
 */

defined( 'ABSPATH' ) || exit;

class Premier_Demo {

	const DEFAULT_SOURCE = 'https://cads-ltd.github.io/hardwick-construction/assets/';

	private static $source = self::DEFAULT_SOURCE;
	private static $log    = array();

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_post_premier_demo', array( __CLASS__, 'handle' ) );
		add_action( 'admin_post_premier_pages', array( __CLASS__, 'handle_pages' ) );
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			WP_CLI::add_command( 'premier demo', array( __CLASS__, 'cli' ) );
			WP_CLI::add_command( 'premier pages', array( __CLASS__, 'cli_pages' ) );
		}
	}

	public static function menu() {
		add_management_page( 'Premier demo content', 'Premier demo content', 'manage_options', 'premier-demo', array( __CLASS__, 'page' ) );
	}

	public static function page() {
		$done = isset( $_GET['done'] ); // phpcs:ignore WordPress.Security.NonceVerification
		?>
		<div class="wrap">
			<h1>Premier demo content</h1>
			<?php if ( $done ) : ?>
				<div class="notice notice-success"><p>Demo content imported. <a href="<?php echo esc_url( home_url( '/' ) ); ?>">View the site</a>.</p></div>
			<?php endif; ?>
			<p>Loads the developments, Brunt Lane's house types and plots, an Elementor home page and the menus from the approved Heritage design.</p>
			<p>Images and PDFs are downloaded from the published prototype. Running it again updates the demo developments rather than duplicating them.</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'premier_demo' ); ?>
				<input type="hidden" name="action" value="premier_demo">
				<p><label>Download files from<br><input type="url" class="regular-text" name="source" value="<?php echo esc_attr( self::DEFAULT_SOURCE ); ?>"></label></p>
				<?php submit_button( 'Import demo content' ); ?>
			</form>
			<hr>
			<h2>Site pages</h2>
			<?php if ( isset( $_GET['pages'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification ?>
				<div class="notice notice-success inline"><p>Site pages checked. <?php echo esc_html( implode( ' ', self::$log ? self::$log : (array) get_transient( 'premier_pages_log' ) ) ); ?></p></div>
			<?php endif; ?>
			<p>Creates any of these that are missing: the <strong>Current developments</strong>, <strong>Completed developments</strong>, <strong>About us</strong> and <strong>Contact us</strong> pages (built with Elementor), the <strong>WPForms enquiry form</strong>, and the footer menu links to them. Pages and forms that already exist are left as they are.</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'premier_pages' ); ?>
				<input type="hidden" name="action" value="premier_pages">
				<?php submit_button( 'Create site pages', 'secondary' ); ?>
			</form>
			<hr>
			<h2>SEO (Rank Math)</h2>
			<?php if ( isset( $_GET['seo'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification ?>
				<div class="notice notice-success inline"><p><?php echo esc_html( implode( ' ', (array) get_transient( 'premier_seo_log' ) ) ); ?></p></div>
			<?php endif; ?>
			<p>Sets up Rank Math for Premier Property Central: business details and local SEO, title and description templates for developments and house types, sitemaps, social sharing defaults, and the titles and descriptions of the main pages. Titles and descriptions already written for a page are kept.</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'premier_seo' ); ?>
				<input type="hidden" name="action" value="premier_seo">
				<?php submit_button( 'Apply SEO settings', 'secondary' ); ?>
			</form>
		</div>
		<?php
	}

	public static function handle() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'premier_demo' );
		@set_time_limit( 600 ); // phpcs:ignore
		self::run( isset( $_POST['source'] ) ? esc_url_raw( wp_unslash( $_POST['source'] ) ) : '' );
		wp_safe_redirect( admin_url( 'tools.php?page=premier-demo&done=1' ) );
		exit;
	}

	public static function handle_pages() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Not allowed.' );
		}
		check_admin_referer( 'premier_pages' );
		self::pages();
		set_transient( 'premier_pages_log', self::$log, 60 );
		wp_safe_redirect( admin_url( 'tools.php?page=premier-demo&pages=1' ) );
		exit;
	}

	/**
	 * Create the site pages (current, completed, about, contact), the enquiry form and footer links.
	 */
	public static function cli_pages() {
		self::pages();
		foreach ( self::$log as $line ) {
			WP_CLI::log( $line );
		}
		WP_CLI::success( 'Site pages checked.' );
	}

	/**
	 * Import the Premier demo content.
	 *
	 * ## OPTIONS
	 *
	 * [--source=<url-or-folder>]
	 * : Base URL, or a folder on this server, holding the prototype's img/ and docs/ folders.
	 */
	public static function cli( $args, $assoc ) {
		self::run( $assoc['source'] ?? '' );
		foreach ( self::$log as $line ) {
			WP_CLI::log( $line );
		}
		WP_CLI::success( 'Demo content imported.' );
	}

	/* ------------------------------------------------------------------ */

	public static function run( $source = '' ) {
		if ( ! function_exists( 'update_field' ) ) {
			self::$log[] = 'ACF Pro (or Secure Custom Fields) must be active.';
			return;
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		self::$source = trailingslashit( $source ?: self::DEFAULT_SOURCE );
		$data         = json_decode( file_get_contents( PREMIER_DEV_DIR . 'demo/demo.json' ), true ); // phpcs:ignore

		self::company( $data['company'] );
		$dev_ids = array();
		foreach ( $data['developments'] as $i => $d ) {
			$dev_ids[ $d['slug'] ] = self::development( $d, $i );
		}
		$home = self::home_page();
		self::menus( $dev_ids );
		self::pages();

		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home );
		update_option( 'permalink_structure', '/%postname%/' );
		flush_rewrite_rules();
		self::$log[] = 'Home page, menus and permalinks set.';
	}

	private static function company( $c ) {
		update_field( 'company_name', $c['name'], 'option' );
		update_field( 'strapline', $c['strapline'], 'option' );
		update_field( 'phone', $c['phone'], 'option' );
		update_field( 'mobile', $c['mobile'], 'option' );
		update_field( 'email', $c['email'], 'option' );
		update_field( 'address', implode( "\n", $c['address'] ), 'option' );
		update_field( 'about', $c['about'], 'option' );
		update_field( 'stats', array_map( fn( $s ) => array( 'value' => $s['value'], 'suffix' => $s['suffix'], 'label' => $s['label'] ), $c['stats'] ), 'option' );
		update_option( 'blogname', $c['name'] );
		update_option( 'blogdescription', $c['strapline'] );
		self::$log[] = 'Company details saved.';
	}

	/** Download a file once and keep it in the media library. */
	private static function media( $path ) {
		if ( ! $path ) {
			return 0;
		}
		$existing = get_posts( array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_premier_demo_file', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'  => $path, // phpcs:ignore WordPress.DB.SlowDBQuery
		) );
		if ( $existing ) {
			return (int) $existing[0];
		}
		if ( preg_match( '#^https?://#', self::$source ) ) {
			$tmp = download_url( self::$source . $path, 120 );
		} else {
			// A folder on the server, e.g. --source=/path/to/hardwick-construction/assets/
			$tmp = wp_tempnam( basename( $path ) );
			if ( ! @copy( self::$source . $path, $tmp ) ) { // phpcs:ignore
				$tmp = new WP_Error( 'premier_copy', 'File not found in ' . self::$source );
			}
		}
		if ( is_wp_error( $tmp ) ) {
			self::$log[] = 'Could not download ' . $path . ': ' . $tmp->get_error_message();
			return 0;
		}
		$id = media_handle_sideload( array( 'name' => basename( $path ), 'tmp_name' => $tmp ), 0 );
		if ( is_wp_error( $id ) ) {
			@unlink( $tmp ); // phpcs:ignore
			self::$log[] = 'Could not import ' . $path . ': ' . $id->get_error_message();
			return 0;
		}
		update_post_meta( $id, '_premier_demo_file', $path );
		return (int) $id;
	}

	private static function upsert( $type, $slug, $title, $order = 0 ) {
		$found = get_page_by_path( $slug, OBJECT, $type );
		$args  = array(
			'post_type'   => $type,
			'post_status' => 'publish',
			'post_title'  => $title,
			'post_name'   => $slug,
			'menu_order'  => $order,
		);
		if ( $found ) {
			$args['ID'] = $found->ID;
			return wp_update_post( $args );
		}
		return wp_insert_post( $args );
	}

	private static function development( $d, $order ) {
		$id = self::upsert( 'development', $d['slug'], $d['name'], $order );

		update_field( 'stage', $d['stage'], $id );
		update_field( 'completed_year', $d['completed'], $id );
		update_field( 'location', $d['location'], $id );
		update_field( 'postcode', $d['postcode'], $id );
		update_field( 'map_query', $d['map_query'], $id );
		update_field( 'headline', $d['headline'], $id );
		update_field( 'summary', $d['summary'], $id );
		update_field( 'description', implode( "\n\n", array_map( fn( $p ) => '<p>' . esc_html( $p ) . '</p>', $d['description'] ) ), $id );
		update_field( 'features', array_map( fn( $f ) => array( 'feature' => $f ), $d['features'] ), $id );
		update_field( 'hero_image', self::media( 'img/' . $d['hero'] ), $id );
		update_field( 'gallery', array_values( array_filter( array_map( fn( $g ) => self::media( 'img/' . $g ), $d['gallery'] ) ) ), $id );
		update_field( 'site_plan', ! empty( $d['site_plan'] ) ? self::media( 'img/' . $d['site_plan'] ) : '', $id );

		// House types: full details for Brunt Lane, simple ones for the sample developments
		$type_ids = array();
		if ( ! empty( $d['house_types'] ) ) {
			foreach ( $d['house_types'] as $t ) {
				$type_ids[ $t['key'] ] = self::house_type( $id, $d['slug'], $t );
			}
		} elseif ( ! empty( $d['plot_types'] ) ) {
			foreach ( $d['plots'] as $p ) {
				if ( ! isset( $type_ids[ $p['type'] ] ) ) {
					$type_ids[ $p['type'] ] = self::house_type( $id, $d['slug'], array(
						'name'    => $p['type'],
						'style'   => $p['beds'] . ' bedroom home',
						'beds'    => $p['beds'],
						'sqm'     => $p['sqft'] ? round( $p['sqft'] / 10.7639, 1 ) : null,
						'sqft'    => $p['sqft'],
						'summary' => 'A ' . $p['beds'] . ' bedroom home at ' . $d['name'] . '. Floor plans to follow.',
					) );
				}
			}
		}

		$plots = array();
		foreach ( $d['plots'] as $p ) {
			$plots[] = array(
				'plot'       => $p['plot'],
				'house_type' => $type_ids[ $p['house_type'] ?? $p['type'] ] ?? '',
				'price'      => $p['price'],
				'status'     => $p['status'],
				'outline'    => $p['outline'] ?? '',
			);
		}
		update_field( 'plots', $plots, $id );
		self::$log[] = sprintf( 'Development: %s (%d plots, %d house types)', $d['name'], count( $plots ), count( $type_ids ) );
		return $id;
	}

	private static function house_type( $dev_id, $dev_slug, $t ) {
		$id = self::upsert( 'house_type', sanitize_title( $dev_slug . '-' . $t['name'] ), $t['name'] );
		update_field( 'development', $dev_id, $id );
		update_field( 'style', $t['style'] ?? '', $id );
		update_field( 'bedrooms', $t['beds'] ?? '', $id );
		update_field( 'floor_area_sqm', $t['sqm'] ?? '', $id );
		update_field( 'floor_area_sqft', $t['sqft'] ?? '', $id );
		update_field( 'summary', $t['summary'] ?? '', $id );
		update_field( 'highlights', array_map( fn( $h ) => array( 'highlight' => $h ), $t['highlights'] ?? array() ), $id );
		update_field( 'image', ! empty( $t['image'] ) ? self::media( 'img/' . $t['image'] ) : '', $id );
		update_field( 'ground_floor', array_map( fn( $r ) => array( 'room' => $r[0], 'size' => $r[1] ), $t['ground'] ?? array() ), $id );
		update_field( 'first_floor', array_map( fn( $r ) => array( 'room' => $r[0], 'size' => $r[1] ), $t['first'] ?? array() ), $id );
		$plans = $t['plans'] ?? array();
		update_field( 'plan_ground', ! empty( $plans['ground'] ) ? self::media( 'img/' . $plans['ground'] ) : '', $id );
		update_field( 'plan_first', ! empty( $plans['first'] ) ? self::media( 'img/' . $plans['first'] ) : '', $id );
		update_field( 'plan_elevations', ! empty( $plans['elevations'] ) ? self::media( 'img/' . $plans['elevations'] ) : '', $id );
		update_field( 'drawings_pdf', ! empty( $t['pdf'] ) ? self::media( 'docs/' . $t['pdf'] ) : '', $id );
		update_field( 'drawing_ref', $t['drawing'] ?? '', $id );
		return $id;
	}

	/* ------------------------------------------------------------------ */

	private static function el_id() {
		return substr( md5( wp_generate_uuid4() ), 0, 7 );
	}

	/** One full-width Elementor container per section widget. */
	private static function el_section( $widget, $settings ) {
		return array(
			'id'       => self::el_id(),
			'elType'   => 'container',
			'isInner'  => false,
			'settings' => array(
				'content_width' => 'full',
				'padding'       => array( 'unit' => 'px', 'top' => '0', 'right' => '0', 'bottom' => '0', 'left' => '0', 'isLinked' => true ),
				'flex_gap'      => array( 'unit' => 'px', 'size' => 0, 'column' => '0', 'row' => '0', 'isLinked' => true ),
			),
			'elements' => array(
				array(
					'id'         => self::el_id(),
					'elType'     => 'widget',
					'widgetType' => $widget,
					'settings'   => $settings,
					'elements'   => array(),
				),
			),
		);
	}

	private static function media_setting( $path ) {
		$id = self::media( $path );
		return array( 'id' => $id, 'url' => $id ? wp_get_attachment_url( $id ) : '' );
	}

	private static function home_page() {
		$id   = self::upsert( 'page', 'home', 'Home' );
		$link = fn( $url ) => array( 'url' => $url, 'is_external' => '', 'nofollow' => '' );
		$data = array(
			self::el_section( 'premier-hero', array(
				'image'        => self::media_setting( 'img/ext-evening.jpg' ),
				'eyebrow'      => 'Housebuilders · Swadlincote',
				'title'        => 'Thoughtfully built homes, <em>rooted</em> in South Derbyshire',
				'button1_text' => 'View current developments',
				'button1_link' => $link( '#current' ),
				'button2_text' => 'Get in touch',
				'button2_link' => $link( '#contact' ),
				'show_selling' => 'yes',
			) ),
			self::el_section( 'premier-intro', array(
				'eyebrow'    => 'Welcome to Premier Property',
				'heading'    => 'Small developments, finished to a standard we would live in ourselves',
				'text'       => 'From a handful of village homes to generous detached family houses, every Premier Property home is planned, built and finished by a local team who take real pride in the detail.',
				'link_text'  => 'Our story',
				'link'       => $link( '#about' ),
				'show_stats' => 'yes',
				'background' => 'plain',
			) ),
			self::el_section( 'premier-developments', array(
				'stage'      => 'current',
				'layout'     => 'rows',
				'eyebrow'    => 'Now selling',
				'heading'    => 'Current developments',
				'intro'      => 'Each of our developments is deliberately small — a considered collection of homes, rather than an estate. Explore what is available today.',
				'background' => 'alt',
				'anchor'     => 'current',
			) ),
			self::el_section( 'premier-developments', array(
				'stage'      => 'completed',
				'layout'     => 'grid',
				'eyebrow'    => 'Our portfolio',
				'heading'    => 'Completed developments',
				'intro'      => 'A selection of the communities we have built across South Derbyshire — every home now sold and lived in.',
				'background' => 'navy',
				'anchor'     => 'completed',
			) ),
			self::el_section( 'premier-about', array(
				'image'      => self::media_setting( 'img/build-plans.jpg' ),
				'eyebrow'    => 'About Premier Property',
				'heading'    => 'A local name on every home we build',
				'text'       => 'Premier Property (Central) is a housebuilder based in Swadlincote, building homes for local people in the towns and villages we know best.',
				'background' => 'plain',
				'anchor'     => 'about',
			) ),
			self::el_section( 'premier-contact', array(
				'eyebrow'    => 'Contact',
				'heading'    => 'Arrange a viewing, or simply ask a question',
				'lead'       => 'Speak to the team directly. We are always happy to talk you through a development, a house type or what is coming next.',
				'button'     => 'Email the team',
				'background' => 'alt',
				'anchor'     => 'contact',
			) ),
		);
		update_post_meta( $id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $id, '_elementor_template_type', 'wp-page' );
		update_post_meta( $id, '_elementor_version', defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '3.0.0' );
		update_post_meta( $id, '_wp_page_template', 'elementor_header_footer' );
		update_post_meta( $id, '_elementor_data', wp_slash( wp_json_encode( $data ) ) );
		delete_post_meta( $id, '_elementor_css' );
		self::$log[] = 'Home page built with Elementor.';
		return $id;
	}

	/* ------------------------------------------------------------------
	 * Site pages and the enquiry form
	 * ------------------------------------------------------------------ */

	public static function pages() {
		// WPForms only lets administrators create forms; WP-CLI runs with no user
		if ( ! get_current_user_id() ) {
			$admins = get_users( array( 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ) );
			if ( $admins ) {
				wp_set_current_user( (int) $admins[0] );
			}
		}
		$form = self::enquiry_form();
		$link = fn( $url ) => array( 'url' => $url, 'is_external' => '', 'nofollow' => '' );
		$cta  = array(
			'eyebrow'    => 'Get in touch',
			'heading'    => 'Interested in one of our homes?',
			'lead'       => 'Speak to the team about any of our developments, arrange a viewing or register your interest in what is coming next.',
			'button'     => 'Email the team',
			'background' => 'alt',
			'page_link'  => 'yes',
			'page_link_text' => 'Send us an enquiry',
		);

		$pages = array(
			'current'   => array( 'current-developments', 'Current developments', array(
				self::el_section( 'premier-page-header', array(
					'image'   => self::media_setting( 'img/ext-brick-row.jpg' ),
					'eyebrow' => 'Now selling',
					'title'   => 'Current <em>developments</em>',
					'lede'    => 'Every development where we have homes for sale or coming soon.',
				) ),
				self::el_section( 'premier-developments', array(
					'stage'      => 'current',
					'layout'     => 'rows',
					'eyebrow'    => 'Homes for sale',
					'heading'    => 'Find your new home',
					'intro'      => 'Choose a development to see its site plan, house types and every plot available.',
					'background' => 'plain',
					'page_link'  => '',
				) ),
				self::el_section( 'premier-contact', $cta ),
			) ),
			'completed' => array( 'completed-developments', 'Completed developments', array(
				self::el_section( 'premier-page-header', array(
					'image'   => self::media_setting( 'img/ext-brick-street.jpg' ),
					'eyebrow' => 'Our portfolio',
					'title'   => 'Completed <em>developments</em>',
					'lede'    => 'The communities we have built — every home now sold and lived in.',
				) ),
				self::el_section( 'premier-developments', array(
					'stage'      => 'completed',
					'layout'     => 'grid',
					'eyebrow'    => 'Homes we have built',
					'heading'    => 'Completed developments',
					'intro'      => 'A selection of the developments we have completed across South Derbyshire.',
					'background' => 'plain',
					'page_link'  => '',
				) ),
				self::el_section( 'premier-developments', array(
					'stage'          => 'current',
					'layout'         => 'grid',
					'eyebrow'        => 'Now selling',
					'heading'        => 'Looking for a new home?',
					'intro'          => '',
					'limit'          => 3,
					'background'     => 'navy',
					'page_link'      => 'yes',
					'page_link_text' => 'View all current developments',
				) ),
			) ),
			'about'     => array( 'about-us', 'About us', array(
				self::el_section( 'premier-page-header', array(
					'image'   => self::media_setting( 'img/build-site.jpg' ),
					'eyebrow' => 'Housebuilders · Swadlincote',
					'title'   => 'About Premier Property <em>Central</em>',
					'lede'    => 'A local housebuilder in Swadlincote, building quality new homes across South Derbyshire.',
				) ),
				self::el_section( 'premier-intro', array(
					'eyebrow'    => 'Who we are',
					'heading'    => 'A local name on every home we build',
					'text'       => 'Placeholder — replace with the client’s About us text.',
					'link_text'  => '',
					'show_stats' => 'yes',
					'background' => 'plain',
				) ),
				self::el_section( 'premier-about', array(
					'image'      => self::media_setting( 'img/build-plans.jpg' ),
					'eyebrow'    => 'How we work',
					'heading'    => 'What we stand for',
					'text'       => '',
					'background' => 'alt',
					'page_link'  => '',
				) ),
				self::el_section( 'premier-contact', array_merge( $cta, array( 'background' => 'plain' ) ) ),
			) ),
			'contact'   => array( 'contact-us', 'Contact us', array(
				self::el_section( 'premier-page-header', array(
					'image'   => self::media_setting( 'img/int-living.jpg' ),
					'eyebrow' => 'Get in touch',
					'title'   => 'Contact <em>us</em>',
					'lede'    => 'We would love to hear from you. Ask about a development, arrange a viewing or register your interest in new homes.',
				) ),
				self::el_section( 'premier-contact', array(
					'eyebrow'    => 'Send an enquiry',
					'heading'    => 'How can we help?',
					'lead'       => 'Fill in the form and a member of the team will be in touch, or call or email us directly.',
					'button'     => '',
					'show_form'  => 'yes',
					'background' => 'plain',
					'anchor'     => 'enquiry',
				) ),
			) ),
		);

		foreach ( $pages as $role => $p ) {
			$existing = get_page_by_path( $p[0], OBJECT, 'page' );
			if ( $existing ) {
				update_option( 'premier_page_' . $role, $existing->ID );
				self::$log[] = $p[1] . ' page already exists (left as it is).';
				continue;
			}
			$id = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => $p[1], 'post_name' => $p[0] ) );
			update_post_meta( $id, '_elementor_edit_mode', 'builder' );
			update_post_meta( $id, '_elementor_template_type', 'wp-page' );
			update_post_meta( $id, '_elementor_version', defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '3.0.0' );
			update_post_meta( $id, '_wp_page_template', 'elementor_header_footer' );
			update_post_meta( $id, '_elementor_data', wp_slash( wp_json_encode( $p[2] ) ) );
			update_option( 'premier_page_' . $role, $id );
			self::$log[] = $p[1] . ' page created.';
		}

		self::footer_menu();
		if ( ! $form && ! function_exists( 'wpforms' ) ) {
			self::$log[] = 'WPForms is not active, so the Contact us page shows an email button instead of a form.';
		}
	}

	/** The WPForms enquiry form. Created once; later edits in WPForms are kept. */
	private static function enquiry_form() {
		if ( ! function_exists( 'wpforms' ) ) {
			return 0;
		}
		$existing = (int) get_option( 'premier_contact_form' );
		if ( $existing && get_post_status( $existing ) === 'publish' ) {
			return $existing;
		}
		$handler = method_exists( wpforms(), 'obj' ) ? wpforms()->obj( 'form' ) : wpforms()->form;
		if ( ! $handler ) {
			return 0;
		}
		$id = $handler->add( 'Website enquiry', array(), array( 'template' => 'blank', 'builder' => false ) );
		if ( ! $id ) {
			self::$log[] = 'Could not create the WPForms enquiry form.';
			return 0;
		}

		$choices = array();
		$n       = 1;
		foreach ( Premier_Data::developments( 'current' ) as $d ) {
			$choices[ $n++ ] = array( 'label' => $d['name'], 'value' => '', 'image' => '' );
		}
		$choices[ $n ] = array( 'label' => 'General enquiry', 'value' => '', 'image' => '' );

		$is_pro = method_exists( wpforms(), 'is_pro' ) && wpforms()->is_pro();
		$c      = Premier_Data::company();
		$data   = array(
			'id'       => $id,
			'field_id' => 6,
			'fields'   => array(
				'1' => array( 'id' => '1', 'type' => 'name', 'label' => 'Your name', 'format' => 'simple', 'required' => '1', 'size' => 'large' ),
				'2' => array( 'id' => '2', 'type' => 'email', 'label' => 'Email', 'required' => '1', 'size' => 'large', 'css' => 'wpforms-one-half wpforms-first' ),
				'3' => $is_pro
					? array( 'id' => '3', 'type' => 'phone', 'label' => 'Phone', 'format' => 'smart', 'size' => 'large', 'css' => 'wpforms-one-half' )
					: array( 'id' => '3', 'type' => 'text', 'label' => 'Phone', 'size' => 'large', 'css' => 'wpforms-one-half' ),
				'4' => array( 'id' => '4', 'type' => 'select', 'label' => 'Which development are you interested in?', 'choices' => $choices, 'placeholder' => 'Choose a development', 'size' => 'large' ),
				'5' => array( 'id' => '5', 'type' => 'textarea', 'label' => 'Your message', 'required' => '1', 'size' => 'medium' ),
			),
			'settings' => array(
				'form_title'             => 'Website enquiry',
				'form_desc'              => '',
				'submit_text'            => 'Send enquiry',
				'submit_text_processing' => 'Sending…',
				'antispam'               => '1',
				'antispam_v3'            => '1',
				'dynamic_population'     => '1',
				'ajax_submit'            => '1',
				'notification_enable'    => '1',
				'notifications'          => array(
					'1' => array(
						'notification_name' => 'Enquiry to the team',
						'email'             => $c['email'] ? $c['email'] : '{admin_email}',
						'subject'           => 'Website enquiry from {field_id="1"}',
						'sender_name'       => $c['name'],
						'sender_address'    => '{admin_email}',
						'replyto'           => '{field_id="2"}',
						'message'           => '{all_fields}',
					),
				),
				'confirmations'          => array(
					'1' => array(
						'name'           => 'Thank you',
						'type'           => 'message',
						'message'        => '<p>Thank you for your enquiry. A member of the team will be in touch shortly.</p>',
						'message_scroll' => '1',
					),
				),
			),
			'meta'     => array( 'template' => 'blank' ),
		);
		$handler->update( $id, $data );
		update_option( 'premier_contact_form', $id );
		update_option( 'premier_contact_form_dev_field', 4 );
		self::$log[] = 'WPForms enquiry form created (sends to ' . ( $c['email'] ? $c['email'] : 'the admin email' ) . ').';
		return (int) $id;
	}

	/** Footer "Explore" links go to the full pages; the main menu keeps scrolling the home page. */
	private static function footer_menu() {
		$items = array();
		foreach ( array( 'current' => 'Current developments', 'completed' => 'Completed developments', 'about' => 'About us', 'contact' => 'Contact us' ) as $role => $title ) {
			$id = Premier_Data::page_id( $role );
			if ( $id ) {
				$items[] = array( $title, $id );
			}
		}
		if ( ! $items ) {
			return;
		}
		$menu = wp_get_nav_menu_object( 'Footer menu' );
		$menu_id = $menu ? $menu->term_id : wp_create_nav_menu( 'Footer menu' );
		foreach ( (array) wp_get_nav_menu_items( $menu_id ) as $old ) {
			wp_delete_post( $old->ID, true );
		}
		foreach ( $items as $i => $item ) {
			wp_update_nav_menu_item( $menu_id, 0, array(
				'menu-item-title'     => $item[0],
				'menu-item-object'    => 'page',
				'menu-item-object-id' => $item[1],
				'menu-item-type'      => 'post_type',
				'menu-item-status'    => 'publish',
				'menu-item-position'  => $i + 1,
			) );
		}
		$locations           = get_theme_mod( 'nav_menu_locations', array() );
		$locations['footer'] = $menu_id;
		set_theme_mod( 'nav_menu_locations', $locations );
		self::$log[] = 'Footer menu links to the full pages.';
	}

	private static function menus( $dev_ids ) {
		$home  = home_url( '/' );
		// A "Plots" menu link only when the site plan has its own page (Heritage A)
		$plots = isset( $dev_ids['brunt-lane'] ) && ! Premier_Data::plots_inline() ? trailingslashit( get_permalink( $dev_ids['brunt-lane'] ) ) . 'plots/' : '';
		$items = array(
			array( 'Current developments', $home . '#current' ),
			array( 'Completed developments', $home . '#completed' ),
			array( 'About', $home . '#about' ),
			array( 'Contact', $home . '#contact' ),
		);
		if ( $plots ) {
			$items[] = array( 'Plots', $plots );
		}
		foreach ( array( 'primary' => 'Main menu', 'footer' => 'Footer menu' ) as $location => $name ) {
			$menu = wp_get_nav_menu_object( $name );
			if ( $menu ) {
				foreach ( (array) wp_get_nav_menu_items( $menu->term_id ) as $old ) {
					wp_delete_post( $old->ID, true );
				}
				$menu_id = $menu->term_id;
			} else {
				$menu_id = wp_create_nav_menu( $name );
			}
			foreach ( $items as $i => $item ) {
				wp_update_nav_menu_item( $menu_id, 0, array(
					'menu-item-title'    => $item[0],
					'menu-item-url'      => $item[1],
					'menu-item-status'   => 'publish',
					'menu-item-type'     => 'custom',
					'menu-item-position' => $i + 1,
				) );
			}
			$locations              = get_theme_mod( 'nav_menu_locations', array() );
			$locations[ $location ] = $menu_id;
			set_theme_mod( 'nav_menu_locations', $locations );
		}
	}
}
