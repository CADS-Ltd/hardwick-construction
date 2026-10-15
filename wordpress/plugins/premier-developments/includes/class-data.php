<?php
/**
 * Reads developments, house types, plots and company details from ACF
 * into plain arrays, so templates and widgets never touch ACF directly.
 */

defined( 'ABSPATH' ) || exit;

class Premier_Data {

	const STATUSES = array(
		'available'   => 'Available',
		'reserved'    => 'Reserved',
		'coming-soon' => 'Coming soon',
		'sold'        => 'Sold',
	);

	private static $cache = array();

	/**
	 * get_field() when ACF is active; plain post meta / options otherwise,
	 * so the site keeps working (with less detail) if ACF is switched off.
	 */
	public static function field( $name, $post_id = false, $format = true ) {
		if ( function_exists( 'get_field' ) ) {
			return get_field( $name, $post_id, $format );
		}
		if ( 'option' === $post_id || 'options' === $post_id ) {
			return get_option( 'options_' . $name );
		}
		return get_post_meta( $post_id ? $post_id : get_the_ID(), $name, true );
	}

	/**
	 * Where a development's site plan lives:
	 *  - false: on its own page, /developments/<name>/plots/ (Heritage A)
	 *  - true:  in the Homes section of the development page itself (Heritage B)
	 * The theme chooses through the 'premier_plots_inline' filter.
	 */
	public static function plots_inline() {
		return (bool) apply_filters( 'premier_plots_inline', false );
	}

	public static function status_label( $status ) {
		return self::STATUSES[ $status ] ?? ucfirst( (string) $status );
	}

	public static function price( $n ) {
		return ( null === $n || '' === $n ) ? '' : '£' . number_format( (float) $n );
	}

	public static function sqft( $n ) {
		return ( null === $n || '' === $n ) ? 'TBC' : number_format( (float) $n );
	}

	/* ------------------------------------------------------------------ */

	public static function company() {
		if ( isset( self::$cache['company'] ) ) {
			return self::$cache['company'];
		}
		$get = function ( $name, $default = '' ) {
			$v = self::field( $name, 'option' );
			return ( null === $v || '' === $v || false === $v ) ? $default : $v;
		};
		$address = trim( (string) $get( 'address' ) );
		$stats   = array();
		foreach ( (array) $get( 'stats', array() ) as $row ) {
			if ( isset( $row['value'] ) && '' !== $row['value'] ) {
				$stats[] = array(
					'value'  => (float) $row['value'],
					'suffix' => (string) ( $row['suffix'] ?? '' ),
					'label'  => (string) ( $row['label'] ?? '' ),
				);
			}
		}
		return self::$cache['company'] = array(
			'name'      => $get( 'company_name', get_bloginfo( 'name' ) ),
			'strapline' => $get( 'strapline', get_bloginfo( 'description' ) ),
			'phone'     => $get( 'phone' ),
			'mobile'    => $get( 'mobile' ),
			'email'     => $get( 'email', get_bloginfo( 'admin_email' ) ),
			'address'   => $address ? array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\n|\r/', $address ) ) ) ) : array(),
			'about'     => $get( 'about' ),
			'stats'     => $stats,
		);
	}

	public static function tel( $number ) {
		return 'tel:' . preg_replace( '/[^0-9+]/', '', (string) $number );
	}

	public static function mailto( $subject = '' ) {
		$c = self::company();
		return 'mailto:' . $c['email'] . ( $subject ? '?subject=' . rawurlencode( $subject ) : '' );
	}

	/* ------------------------------------------------------------------ */

	/**
	 * Developments by stage ('current', 'completed' or '' for all).
	 * Completed ones are newest first.
	 */
	public static function developments( $stage = '' ) {
		$ids  = get_posts( array(
			'post_type'   => 'development',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => array( 'menu_order' => 'ASC', 'date' => 'ASC' ),
			'fields'      => 'ids',
		) );
		$list = array();
		foreach ( $ids as $id ) {
			$d = self::development( $id );
			if ( $d && ( ! $stage || $d['stage'] === $stage ) ) {
				$list[] = $d;
			}
		}
		if ( 'completed' === $stage ) {
			usort( $list, fn( $a, $b ) => (int) $b['completed'] <=> (int) $a['completed'] );
		}
		return $list;
	}

	public static function development( $id = null ) {
		$id = $id ? (int) $id : get_the_ID();
		if ( ! $id || get_post_type( $id ) !== 'development' ) {
			return null;
		}
		if ( isset( self::$cache[ 'd' . $id ] ) ) {
			return self::$cache[ 'd' . $id ];
		}

		$types = array();
		foreach ( self::house_type_ids_for( $id ) as $tid ) {
			$types[ $tid ] = self::house_type( $tid );
		}

		$plots = array();
		foreach ( (array) self::field( 'plots', $id ) as $row ) {
			if ( empty( $row['plot'] ) && '0' !== ( $row['plot'] ?? '' ) ) {
				continue;
			}
			$tid = isset( $row['house_type'] ) ? (int) $row['house_type'] : 0;
			$t   = $tid && isset( $types[ $tid ] ) ? $types[ $tid ] : ( $tid ? self::house_type( $tid ) : null );
			$plots[] = array(
				'plot'       => (string) $row['plot'],
				'house_type' => $t ? $t['id'] : 0,
				'type'       => $t ? $t['name'] : '',
				'beds'       => $t ? $t['beds'] : '',
				'sqft'       => $t ? $t['sqft'] : null,
				'price'      => ( '' === ( $row['price'] ?? '' ) || null === $row['price'] ) ? null : (float) $row['price'],
				'status'     => isset( self::STATUSES[ $row['status'] ?? '' ] ) ? $row['status'] : 'available',
				'outline'    => self::clean_outline( $row['outline'] ?? '' ),
			);
		}

		$counts = array( 'available' => 0, 'reserved' => 0, 'coming-soon' => 0, 'sold' => 0, 'total' => count( $plots ) );
		foreach ( $plots as $p ) {
			$counts[ $p['status'] ]++;
		}
		$for_sale = array_filter( $plots, fn( $p ) => in_array( $p['status'], array( 'available', 'coming-soon' ), true ) && $p['price'] );
		$beds     = array_filter( array_map( fn( $p ) => (int) $p['beds'], $plots ) );

		$features = array();
		foreach ( (array) self::field( 'features', $id ) as $row ) {
			if ( ! empty( $row['feature'] ) ) {
				$features[] = $row['feature'];
			}
		}

		$site_plan = (int) self::field( 'site_plan', $id );
		$stage     = self::field( 'stage', $id ) === 'completed' ? 'completed' : 'current';

		return self::$cache[ 'd' . $id ] = array(
			'id'          => $id,
			'slug'        => get_post_field( 'post_name', $id ),
			'name'        => get_the_title( $id ),
			'url'         => get_permalink( $id ),
			'plots_url'   => $site_plan ? ( self::plots_inline() ? get_permalink( $id ) . '#homes' : trailingslashit( get_permalink( $id ) ) . 'plots/' ) : '',
			'stage'       => $stage,
			'completed'   => (string) self::field( 'completed_year', $id ),
			'location'    => (string) self::field( 'location', $id ),
			'postcode'    => (string) self::field( 'postcode', $id ),
			'map_query'   => (string) ( self::field( 'map_query', $id ) ?: self::field( 'postcode', $id ) ?: get_the_title( $id ) . ', ' . self::field( 'location', $id ) ),
			'headline'    => (string) self::field( 'headline', $id ),
			'summary'     => (string) self::field( 'summary', $id ),
			'description' => (string) self::field( 'description', $id ),
			'hero'        => (int) self::field( 'hero_image', $id ),
			'gallery'     => array_values( array_filter( array_map( 'intval', (array) self::field( 'gallery', $id ) ) ) ),
			'features'    => $features,
			'site_plan'   => $site_plan,
			'house_types' => array_values( $types ),
			'plots'       => $plots,
			'counts'      => $counts,
			'price_from'  => $for_sale ? min( array_column( $for_sale, 'price' ) ) : null,
			'bed_range'   => $beds ? ( min( $beds ) === max( $beds ) ? min( $beds ) . ' bed' : min( $beds ) . ' & ' . max( $beds ) . ' bed' ) : '',
		);
	}

	/** House type ids attached to a development, in title order (Type A, Type B…). */
	public static function house_type_ids_for( $dev_id ) {
		return get_posts( array(
			'post_type'   => 'house_type',
			'post_status' => 'publish',
			'numberposts' => -1,
			'orderby'     => 'title',
			'order'       => 'ASC',
			'fields'      => 'ids',
			'meta_query'  => array( array( 'key' => 'development', 'value' => (int) $dev_id ) ),
		) );
	}

	public static function house_type( $id = null ) {
		$id = $id ? (int) $id : get_the_ID();
		if ( ! $id || get_post_type( $id ) !== 'house_type' ) {
			return null;
		}
		if ( isset( self::$cache[ 't' . $id ] ) ) {
			return self::$cache[ 't' . $id ];
		}
		$rooms = function ( $name ) use ( $id ) {
			$out = array();
			foreach ( (array) self::field( $name, $id ) as $row ) {
				if ( ! empty( $row['room'] ) ) {
					$out[] = array( $row['room'], (string) ( $row['size'] ?? '' ) );
				}
			}
			return $out;
		};
		$highlights = array();
		foreach ( (array) self::field( 'highlights', $id ) as $row ) {
			if ( ! empty( $row['highlight'] ) ) {
				$highlights[] = $row['highlight'];
			}
		}
		$sqm  = self::field( 'floor_area_sqm', $id );
		$sqft = self::field( 'floor_area_sqft', $id );
		if ( ( '' === $sqft || null === $sqft ) && is_numeric( $sqm ) && $sqm > 0 ) {
			$sqft = round( $sqm * 10.7639 );
		}
		$pdf = (int) self::field( 'drawings_pdf', $id );
		return self::$cache[ 't' . $id ] = array(
			'id'          => $id,
			'key'         => (string) $id,
			'name'        => get_the_title( $id ),
			'url'         => get_permalink( $id ),
			'development' => (int) self::field( 'development', $id, false ),
			'style'       => (string) self::field( 'style', $id ),
			'beds'        => (int) ( self::field( 'bedrooms', $id ) ?: 0 ),
			'sqm'         => is_numeric( $sqm ) && $sqm > 0 ? (float) $sqm : null,
			'sqft'        => is_numeric( $sqft ) && $sqft > 0 ? (int) $sqft : null,
			'summary'     => (string) self::field( 'summary', $id ),
			'highlights'  => $highlights,
			'image'       => (int) self::field( 'image', $id ),
			'ground'      => $rooms( 'ground_floor' ),
			'first'       => $rooms( 'first_floor' ),
			'plans'       => array_filter( array(
				'ground'     => (int) self::field( 'plan_ground', $id ),
				'first'      => (int) self::field( 'plan_first', $id ),
				'elevations' => (int) self::field( 'plan_elevations', $id ),
			) ),
			'pdf'         => $pdf ? array(
				'url'  => wp_get_attachment_url( $pdf ),
				'size' => size_format( (int) @filesize( get_attached_file( $pdf ) ), 0 ),
				'ref'  => (string) self::field( 'drawing_ref', $id ),
			) : null,
		);
	}

	public static function area_label( $t ) {
		if ( ! $t || ! $t['sqm'] ) {
			return 'Floor area to be confirmed';
		}
		return 'Approx. ' . rtrim( rtrim( number_format( $t['sqm'], 1 ), '0' ), '.' ) . ' m² · ' . self::sqft( $t['sqft'] ) . ' sq ft';
	}

	/** Outline points are "x,y x,y …" in percent of the site plan image (0–100). */
	public static function clean_outline( $s ) {
		$pts = array();
		foreach ( preg_split( '/\s+/', trim( (string) $s ) ) as $pair ) {
			if ( preg_match( '/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/', $pair, $m ) ) {
				$pts[] = round( max( 0, min( 100, (float) $m[1] ) ), 2 ) . ',' . round( max( 0, min( 100, (float) $m[2] ) ), 2 );
			}
		}
		return count( $pts ) >= 3 ? implode( ' ', $pts ) : '';
	}

	/** Plots of one house type at a development. */
	public static function plots_of_type( $dev, $type_id ) {
		return array_values( array_filter( $dev['plots'], fn( $p ) => (int) $p['house_type'] === (int) $type_id ) );
	}
}
