<?php
/**
 * HTML for the reusable pieces: development lists, the plot table, the
 * interactive site plan and house type cards. Used by the theme templates,
 * the Elementor widgets and the shortcodes, so they always look the same.
 * Class names match the Heritage design in the Premier Heritage theme.
 */

defined( 'ABSPATH' ) || exit;

class Premier_Render {

	const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5"/></svg>';

	public static function img( $id, $size = 'large', $attrs = array() ) {
		if ( ! $id ) {
			return '';
		}
		return wp_get_attachment_image( $id, $size, false, $attrs + array( 'loading' => 'lazy' ) );
	}

	public static function img_url( $id, $size = 'large' ) {
		return $id ? (string) wp_get_attachment_image_url( $id, $size ) : '';
	}

	private static function e( $s ) {
		return esc_html( (string) $s );
	}

	/* ------------------------------------------------------------------
	 * Development lists
	 * ------------------------------------------------------------------ */

	/** Current developments as large alternating image / text rows. */
	public static function development_rows( $list ) {
		if ( ! $list ) {
			return '<p class="section-intro">New developments are coming soon.</p>';
		}
		$out = '<div class="dev-rows">';
		foreach ( array_values( $list ) as $i => $d ) {
			$c    = $d['counts'];
			$num  = str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT );
			$plan = $d['plots_url']
				? '<a class="link-arrow draw" href="' . esc_url( $d['plots_url'] ) . '">View plots<span class="sr-only"> — ' . self::e( $d['name'] ) . '</span> ' . self::ARROW . '</a>'
				: '';
			$out .= '<article class="dev-row' . ( $i % 2 ? ' is-flipped' : '' ) . '">'
				. '<a class="dev-row-media frame" href="' . esc_url( $d['url'] ) . '" tabindex="-1" aria-hidden="true" data-reveal>'
				. '<span class="frame-clip">' . ( self::img( $d['hero'], 'large', array( 'alt' => '' ) ) ?: self::empty_media( $d ) ) . '</span></a>'
				. '<div class="dev-row-body" data-reveal>'
				. '<p class="dev-row-index"><span>' . $num . '</span>' . self::e( $d['location'] ) . '</p>'
				. '<h3 class="dev-row-title"><a href="' . esc_url( $d['url'] ) . '">' . self::e( $d['name'] ) . '</a></h3>'
				. ( $d['headline'] ? '<p class="dev-row-headline">' . self::e( $d['headline'] ) . '</p>' : '' )
				. ( $d['summary'] ? '<p class="dev-row-summary">' . self::e( $d['summary'] ) . '</p>' : '' )
				. '<dl class="meta">'
				. ( $d['upcoming']
					? '<div><dt>Homes</dt><dd>Details to follow</dd></div>'
						. '<div><dt>Prices</dt><dd>To be announced</dd></div>'
						. '<div><dt>Availability</dt><dd><span class="dot is-soon" aria-hidden="true"></span>Coming soon</dd></div>'
					: '<div><dt>Homes</dt><dd>' . self::e( $d['bed_range'] ?: '—' ) . '</dd></div>'
						. '<div><dt>Prices from</dt><dd>' . self::e( $d['price_from'] ? Premier_Data::price( $d['price_from'] ) : 'Enquire' ) . '</dd></div>'
						. '<div><dt>Availability</dt><dd><span class="dot" aria-hidden="true"></span>' . self::e( $c['available'] ? $c['available'] . ' available' : 'Register interest' ) . '</dd></div>' )
				. '</dl>'
				. '<p class="dev-row-links"><a class="link-arrow draw" href="' . esc_url( $d['url'] ) . '">View development<span class="sr-only"> — ' . self::e( $d['name'] ) . '</span> ' . self::ARROW . '</a>' . $plan . '</p>'
				. '</div></article>';
		}
		return $out . '</div>';
	}

	public static function development_card( $d ) {
		$tag = 'completed' === $d['stage'] ? trim( 'Completed ' . $d['completed'] ) : ( $d['upcoming'] ? 'Coming soon' : 'Now selling' );
		return '<a class="done-card" href="' . esc_url( $d['url'] ) . '" data-reveal>'
			. '<span class="done-media">' . ( self::img( $d['hero'], 'medium_large', array( 'alt' => $d['name'] . ', ' . $d['location'] ) ) ?: self::empty_media( $d ) ) . '</span>'
			. '<span class="done-meta">' . self::e( $tag ) . '</span>'
			. '<span class="done-name">' . self::e( $d['name'] ) . '</span>'
			. '<span class="done-loc">' . self::e( $d['location'] ) . '</span>'
			. '</a>';
	}

	/**
	 * Stand-in for a development that has no photo yet (Main photo left empty):
	 * its name on navy under a gold roofline.
	 */
	public static function empty_media( $d ) {
		return '<span class="dev-empty">'
			. '<svg class="dev-empty-mark" viewBox="0 0 120 44" aria-hidden="true"><path d="M2 42h116M12 42V25L30 9l18 16v17M48 25 64 11l16 14v17M80 25l14-12 14 12v17"/></svg>'
			. '<span class="dev-empty-name">' . self::e( $d['name'] ) . '</span>'
			. '<small>' . ( $d['upcoming'] ? 'Coming soon' : 'Photos to follow' ) . '</small></span>';
	}

	/** Completed (or any) developments as a grid of cards. */
	public static function development_grid( $list, $class = '' ) {
		if ( ! $list ) {
			return '';
		}
		return '<div class="completed-grid ' . esc_attr( $class ) . '" data-stagger>' . implode( '', array_map( array( __CLASS__, 'development_card' ), $list ) ) . '</div>';
	}

	/** The Completed developments page before any development is marked completed. */
	public static function completed_holding() {
		$current = Premier_Data::page_url( 'current' );
		return '<div class="sold-out" data-reveal>'
			. '<span class="sold-out-rule" aria-hidden="true"></span>'
			. '<p class="sold-out-title">Our completed developments will be shown here soon</p>'
			. '<p>We are gathering photographs of the homes we have built. In the meantime, take a look at the developments we are building now.</p>'
			. ( $current ? '<a class="btn btn-navy" href="' . esc_url( $current ) . '">View current developments</a>' : '' )
			. '</div>';
	}

	/** The "Now selling" strip under the home page hero. */
	public static function now_selling_list( $list ) {
		$out = '';
		foreach ( $list as $d ) {
			if ( $d['upcoming'] ) {
				continue;
			}
			$out .= '<li><a class="draw" href="' . esc_url( $d['url'] ) . '">' . self::e( $d['name'] )
				. '<span> · ' . self::e( explode( ',', $d['location'] )[0] ) . '</span></a></li>';
		}
		return $out;
	}

	public static function stats( $stats ) {
		if ( ! $stats ) {
			return '';
		}
		$out = '<ul class="stats" data-stagger>';
		foreach ( $stats as $s ) {
			$v    = rtrim( rtrim( number_format( $s['value'], 2, '.', '' ), '0' ), '.' );
			$out .= '<li data-reveal><span class="stat-num"><span data-count="' . esc_attr( $v ) . '" data-suffix="' . esc_attr( $s['suffix'] ) . '">0' . self::e( $s['suffix'] ) . '</span></span>'
				. '<span class="stat-label">' . self::e( $s['label'] ) . '</span></li>';
		}
		return $out . '</ul>';
	}

	/* ------------------------------------------------------------------
	 * Availability: summary counts + every plot
	 * ------------------------------------------------------------------ */

	/**
	 * @param array $d    Development data.
	 * @param array $opts plots   => override the plot list (e.g. one house type)
	 *                    selected=> plot number to highlight
	 *                    enquire => anchor or URL for "contact us"
	 */
	public static function availability( $d, $opts = array() ) {
		$plots = $opts['plots'] ?? $d['plots'];
		if ( ! $plots ) {
			return '';
		}
		$counts = array( 'available' => 0, 'reserved' => 0, 'coming-soon' => 0, 'sold' => 0 );
		foreach ( $plots as $p ) {
			$counts[ $p['status'] ]++;
		}
		$out = '<ul class="avail-summary" data-stagger>';
		foreach ( Premier_Data::STATUSES as $k => $label ) {
			$out .= '<li class="is-' . $k . '" data-reveal><span class="avail-num" data-count="' . (int) $counts[ $k ] . '">' . (int) $counts[ $k ] . '</span><span class="avail-label">' . self::e( $label ) . '</span></li>';
		}
		$out .= '</ul><div class="table-wrap" data-reveal><table class="plots">'
			. '<caption class="sr-only">Plots and availability at ' . self::e( $d['name'] ) . '</caption>'
			. '<thead><tr><th scope="col">Plot</th><th scope="col">House type</th><th scope="col">Bedrooms</th><th scope="col">Sq ft</th><th scope="col">Price</th><th scope="col">Status</th></tr></thead><tbody>';
		foreach ( $plots as $p ) {
			$sold  = 'sold' === $p['status'];
			$price = $sold
				? '<s aria-hidden="true">' . self::e( Premier_Data::price( $p['price'] ) ) . '</s><span class="sr-only">Sold</span>'
				: self::e( Premier_Data::price( $p['price'] ) ?: 'Enquire' );
			$type  = $p['house_type']
				? '<a class="draw" href="' . esc_url( add_query_arg( 'plot', rawurlencode( $p['plot'] ), get_permalink( $p['house_type'] ) ) ) . '">' . self::e( $p['type'] ) . '</a>'
				: self::e( $p['type'] ?: '—' );
			$sel   = isset( $opts['selected'] ) && (string) $opts['selected'] === (string) $p['plot'] ? ' is-selected' : '';
			$out  .= '<tr class="plot is-' . esc_attr( $p['status'] ) . $sel . '" data-plot="' . esc_attr( $p['plot'] ) . '">'
				. '<td data-label="Plot"><span class="plot-no">' . self::e( $p['plot'] ) . '</span></td>'
				. '<td data-label="House type" class="plot-type">' . $type . '</td>'
				. '<td data-label="Bedrooms">' . self::e( $p['beds'] ?: '—' ) . '</td>'
				. '<td data-label="Sq ft">' . self::e( Premier_Data::sqft( $p['sqft'] ) ) . '</td>'
				. '<td data-label="Price" class="plot-price">' . $price . '</td>'
				. '<td data-label="Status"><span class="badge badge-' . esc_attr( $p['status'] ) . '">' . self::e( Premier_Data::status_label( $p['status'] ) ) . '</span></td>'
				. '</tr>';
		}
		$enquire = $opts['enquire'] ?? '#enquire';
		return $out . '</tbody></table></div>'
			. '<p class="table-note">Prices and availability are correct at the time of publishing and may change. Please <a class="draw" href="' . esc_url( $enquire ) . '">contact us</a> for the latest information.</p>';
	}

	/* ------------------------------------------------------------------
	 * Interactive site plan
	 * ------------------------------------------------------------------ */

	public static function site_plan( $d, $opts = array() ) {
		if ( ! $d || ! $d['site_plan'] ) {
			return '';
		}
		wp_enqueue_script( 'premier-site-plan' );

		$meta  = wp_get_attachment_metadata( $d['site_plan'] );
		$ratio = ( ! empty( $meta['width'] ) && ! empty( $meta['height'] ) ) ? $meta['width'] . ' / ' . $meta['height'] : '4 / 3';

		$types = array();
		foreach ( $d['house_types'] as $i => $t ) {
			$types[ $t['id'] ] = array(
				'order'      => $i,
				'name'       => $t['name'],
				'style'      => $t['style'],
				'beds'       => $t['beds'],
				'area'       => Premier_Data::area_label( $t ),
				'summary'    => $t['summary'],
				'image'      => self::img_url( $t['image'], 'large' ),
				'ground'     => $t['ground'],
				'first'      => $t['first'],
				'url'        => $t['url'],
			);
		}
		$plots = array();
		foreach ( $d['plots'] as $p ) {
			$plots[] = array(
				'plot'    => $p['plot'],
				'type'    => $p['house_type'] ? (string) $p['house_type'] : '',
				'typeName'=> $p['type'],
				'beds'    => $p['beds'],
				'status'  => $p['status'],
				'label'   => Premier_Data::status_label( $p['status'] ),
				'price'   => $p['price'] ? Premier_Data::price( $p['price'] ) : '',
				'outline' => $p['outline'],
			);
		}
		$data = array(
			'name'    => $d['name'],
			'email'   => Premier_Data::company()['email'],
			'types'   => (object) $types,
			'plots'   => $plots,
		);

		$filter = '<button type="button" class="type-btn" data-type="" aria-pressed="false">All types</button>';
		foreach ( $types as $id => $t ) {
			$filter .= '<button type="button" class="type-btn" data-type="' . (int) $id . '" aria-pressed="false">' . self::e( $t['name'] ) . '</button>';
		}

		return '<div class="plan-block" data-premier-plan>'
			. '<script type="application/json" class="plan-data">' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . '</script>'
			. '<div class="plan-toolbar" data-reveal>'
			. '<div class="type-filter" role="group" aria-label="Highlight a house type">' . $filter . '</div>'
			. '<ul class="plan-legend" aria-label="Key">'
			. '<li><span class="key key-available" aria-hidden="true"></span>Available</li>'
			. '<li><span class="key key-reserved" aria-hidden="true"></span>Reserved</li>'
			. '<li><span class="key key-coming-soon" aria-hidden="true"></span>Coming soon</li>'
			. '<li><span class="key key-sold" aria-hidden="true"></span>Sold</li>'
			. '</ul></div>'
			. '<div class="plan-layout">'
			. '<figure class="plan-figure" data-reveal>'
			. '<div class="plan-canvas" style="aspect-ratio:' . esc_attr( $ratio ) . '">'
			. self::img( $d['site_plan'], 'full', array( 'alt' => 'Site plan of ' . $d['name'] . ' showing ' . count( $d['plots'] ) . ' plots', 'loading' => 'eager', 'sizes' => '(max-width: 960px) 100vw, 800px' ) )
			. '<svg class="plan-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="group" aria-label="Plots on the site plan"></svg>'
			. '<div class="plan-tip" aria-hidden="true"></div>'
			. '</div>'
			. '<figcaption class="plan-caption">Illustrative site plan — not to scale. Plot positions, landscaping and finishes may vary.</figcaption>'
			. '</figure>'
			. '<aside class="plan-panel" aria-live="polite" data-reveal style="--i:1"></aside>'
			. '</div></div>';
	}

	/* ------------------------------------------------------------------
	 * House type cards
	 * ------------------------------------------------------------------ */

	/**
	 * @param array $d    Development data.
	 * @param array $opts exclude  => house type id to leave out
	 *                    show_on_plan => add a "Show on plan" button (site plan on the same page)
	 */
	public static function house_type_cards( $d, $opts = array() ) {
		$types = array_filter( $d['house_types'], fn( $t ) => empty( $opts['exclude'] ) || (int) $t['id'] !== (int) $opts['exclude'] );
		if ( ! $types ) {
			return '';
		}
		$out = '<div class="type-grid" data-stagger>';
		foreach ( $types as $t ) {
			$plots = Premier_Data::plots_of_type( $d, $t['id'] );
			$media = $t['image']
				? self::img( $t['image'], 'medium_large', array( 'alt' => '' ) )
				: '<span class="type-card-empty"><span>' . self::e( $t['name'] ) . '</span><small>Images to follow</small></span>';
			$chips = '';
			foreach ( $plots as $p ) {
				$chips .= '<li class="is-' . esc_attr( $p['status'] ) . '" title="' . esc_attr( Premier_Data::status_label( $p['status'] ) ) . '"><span class="tcp-dot" aria-hidden="true"></span>Plot ' . self::e( $p['plot'] ) . '<span class="sr-only"> — ' . self::e( Premier_Data::status_label( $p['status'] ) ) . '</span></li>';
			}
			$list = $t['highlights']
				? '<ul class="type-card-list">' . implode( '', array_map( fn( $h ) => '<li>' . self::e( $h ) . '</li>', $t['highlights'] ) ) . '</ul>'
				: ( $t['summary'] ? '<p class="type-card-text">' . self::e( $t['summary'] ) . '</p>' : '' );
			$show = ! empty( $opts['show_on_plan'] ) && $d['site_plan']
				? '<button type="button" class="link-arrow draw" data-show-type="' . (int) $t['id'] . '">Show on plan</button>'
				: '';
			$out .= '<article class="type-card" data-reveal>'
				. '<a class="type-card-media" href="' . esc_url( $t['url'] ) . '" tabindex="-1" aria-hidden="true">' . $media . '</a>'
				. '<div class="type-card-body">'
				. '<p class="type-card-name"><a href="' . esc_url( $t['url'] ) . '">' . self::e( $t['name'] ) . '</a></p>'
				. ( $t['style'] ? '<p class="type-card-style">' . self::e( $t['style'] ) . '</p>' : '' )
				. '<p class="type-card-area">' . self::e( Premier_Data::area_label( $t ) ) . '</p>'
				. $list
				. ( $chips ? '<ul class="type-card-plots" aria-label="Plots">' . $chips . '</ul>' : '' )
				. '<p class="type-card-links"><a class="link-arrow draw" href="' . esc_url( $t['url'] ) . '">View details ' . self::ARROW . '</a>' . $show . '</p>'
				. '</div></article>';
		}
		return $out . '</div>';
	}

	/** Banner on a development page linking to its /plots/ page. */
	public static function plan_cta( $d ) {
		if ( ! $d['plots_url'] ) {
			return '';
		}
		return '<a class="plan-cta" href="' . esc_url( $d['plots_url'] ) . '" data-reveal>'
			. '<span class="plan-cta-media">' . self::img( $d['site_plan'], 'medium_large', array( 'alt' => '' ) ) . '</span>'
			. '<span class="plan-cta-body">'
			. '<span class="eyebrow">Interactive site plan</span>'
			. '<span class="plan-cta-title">Explore every plot at ' . self::e( $d['name'] ) . '</span>'
			. '<span class="plan-cta-text">Hover over each home to see its house type, room sizes and availability.</span>'
			. '<span class="link-arrow">View the plots ' . self::ARROW . '</span>'
			. '</span></a>';
	}

	/** Facts list (dl rows). */
	public static function facts( $rows ) {
		$out = '<dl>';
		foreach ( $rows as $r ) {
			$out .= '<div><dt>' . self::e( $r[0] ) . '</dt><dd>' . self::e( $r[1] ) . '</dd></div>';
		}
		return $out . '</dl>';
	}

	/** Gallery grid with lightbox hooks. */
	public static function gallery( $ids, $name ) {
		$ids = array_values( array_filter( $ids ) );
		if ( ! $ids ) {
			return '';
		}
		$out = '<div class="gallery" data-stagger data-images="' . count( $ids ) . '" data-lightbox-group="' . esc_attr( $name ) . '">';
		foreach ( $ids as $i => $id ) {
			$out .= '<button type="button" class="g-item' . ( 0 === $i ? ' g-lead' : '' ) . '" data-reveal data-full="' . esc_url( self::img_url( $id, 'full' ) ) . '">'
				. self::img( $id, 0 === $i ? 'large' : 'medium_large', array( 'alt' => $name . ' — image ' . ( $i + 1 ) . ' of ' . count( $ids ) ) )
				. '<span class="g-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span></button>';
		}
		return $out . '</div>';
	}
}
