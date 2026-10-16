<?php
/**
 * House type page: picture, overview, floor plans, availability, PDF download.
 * ?plot=7 highlights that plot.
 *
 * @var array $args['t'] House type data; $args['d'] its development (may be null).
 */

defined( 'ABSPATH' ) || exit;

$t      = $args['t'];
$d      = $args['d'];
$arrow  = Premier_Render::ARROW;
$list   = $d ? Premier_Data::plots_of_type( $d, $t['id'] ) : array();
$counts = array( 'available' => 0 );
foreach ( $list as $p ) {
	$counts[ $p['status'] ] = ( $counts[ $p['status'] ] ?? 0 ) + 1;
}
$for_sale = array_filter( $list, fn( $p ) => in_array( $p['status'], array( 'available', 'coming-soon' ), true ) && $p['price'] );
$from     = $for_sale ? min( array_column( $for_sale, 'price' ) ) : null;
$sel_no   = isset( $_GET['plot'] ) ? sanitize_text_field( wp_unslash( $_GET['plot'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
$sel      = null;
foreach ( $list as $p ) {
	if ( '' !== $sel_no && (string) $p['plot'] === $sel_no ) {
		$sel = $p;
	}
}
$area     = $t['sqm'] ? Premier_Data::area_label( $t ) : 'To be confirmed';
$hero_img = $t['image'] ?: ( $d ? ( $d['site_plan'] ?: $d['hero'] ) : 0 );
$plans_url = $d && $d['plots_url'] ? add_query_arg( 'type', $t['id'], $d['plots_url'] ) : ( $d ? $d['url'] . '#homes' : home_url( '/' ) );
$the_name  = preg_match( '/^the\s/i', $t['name'] ) ? $t['name'] : 'the ' . $t['name']; // "the Type C", but "The Melbourne"
$download  = '<svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>';

$facts = array(
	array( 'Development', $d ? $d['name'] : '—' ),
	array( 'Bedrooms', $t['beds'] ? (string) $t['beds'] : '—' ),
	array( 'Floor area', $area ),
	array( 'Plots', $list ? implode( ', ', array_column( $list, 'plot' ) ) : '—' ),
	array( 'Available now', (string) $counts['available'] ),
	array( 'Prices from', $from ? Premier_Data::price( $from ) : 'Enquire' ),
);

if ( ! function_exists( 'premier_plan_sheet' ) ) :
function premier_plan_sheet( $id, $label, $rows, $alt ) {
	$out = '<figure class="plan-sheet" data-reveal>'
		. '<button type="button" class="g-item plan-shot" data-full="' . esc_url( Premier_Render::img_url( $id, 'full' ) ) . '">'
		. Premier_Render::img( $id, 'large', array( 'alt' => $alt ) )
		. '<span class="g-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span></button>'
		. '<figcaption><span class="pr-title">' . esc_html( $label ) . '</span>';
	if ( $rows ) {
		$out .= '<dl class="room-list">';
		foreach ( $rows as $r ) {
			$out .= '<div><dt>' . esc_html( $r[0] ) . '</dt><dd>' . esc_html( $r[1] ?: '—' ) . '</dd></div>';
		}
		$out .= '</dl>';
	}
	return $out . '</figcaption></figure>';
}
endif;
?>
<main id="main">
	<section class="hero hero-dev hero-type" aria-labelledby="type-name">
		<div class="hero-media" aria-hidden="true"><?php echo Premier_Render::img( $hero_img, 'full', array( 'alt' => '', 'loading' => 'eager' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<div class="hero-shade" aria-hidden="true"></div>
		<div class="wrap hero-content">
			<a class="back-link hero-fade" style="--d:.1s" href="<?php echo esc_url( $plans_url ); ?>">
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m5-5-5 5 5 5"/></svg><span><?php echo esc_html( $d ? ( $d['plots_url'] && ! Premier_Data::plots_inline() ? 'Back to the plots' : 'Back to ' . $d['name'] ) : 'Back to the home page' ); ?></span>
			</a>
			<?php if ( $d ) : ?><p class="eyebrow eyebrow-light hero-fade" style="--d:.25s"><?php echo esc_html( $d['name'] . ' · ' . $d['location'] ); ?></p><?php endif; ?>
			<h1 class="hero-title hero-fade" style="--d:.45s" id="type-name"><?php echo esc_html( $t['name'] ); ?></h1>
			<?php if ( $t['style'] ) : ?><p class="hero-lede hero-fade" style="--d:.7s"><?php echo esc_html( $t['style'] ); ?></p><?php endif; ?>
			<p class="hero-chip hero-fade" style="--d:.95s"><span class="chip-dot" aria-hidden="true"></span><?php
				echo esc_html( ( $t['beds'] ? $t['beds'] . ' bedrooms · ' : '' ) . ( $t['sqm'] ? $area . ' · ' : '' ) . ( $counts['available'] ? $counts['available'] . ' available now' : 'Register your interest' ) . ( $from ? ' · From ' . Premier_Data::price( $from ) : '' ) );
			?></p>
		</div>
	</section>

	<nav class="subnav" aria-label="On this page">
		<div class="wrap subnav-inner">
			<span class="subnav-name" aria-hidden="true"><?php echo esc_html( $t['name'] ); ?></span>
			<ul class="subnav-links">
				<li><a href="#overview" data-sub>Overview</a></li>
				<li><a href="#floor-plans" data-sub>Floor plans</a></li>
				<?php if ( $list ) : ?><li><a href="#homes" data-sub>Availability</a></li><?php endif; ?>
				<li><a href="#downloads" data-sub>Downloads</a></li>
			</ul>
			<a class="btn btn-navy btn-sm subnav-cta" href="#enquire">Enquire</a>
		</div>
	</nav>

	<?php if ( $t['image'] ) : ?>
	<section class="type-showcase" aria-label="The home">
		<div class="wrap">
			<?php $meta = wp_get_attachment_metadata( $t['image'] ); ?>
			<figure class="showcase-frame" data-reveal data-lightbox-group="<?php echo esc_attr( $t['name'] ); ?>"<?php if ( ! empty( $meta['width'] ) && ! empty( $meta['height'] ) ) : ?> style="--ar:<?php echo esc_attr( round( $meta['width'] / $meta['height'], 4 ) ); ?>"<?php endif; ?>>
				<button type="button" class="g-item showcase-shot" data-full="<?php echo esc_url( Premier_Render::img_url( $t['image'], 'full' ) ); ?>">
					<?php echo Premier_Render::img( $t['image'], 'full', array( 'alt' => $t['name'] . ( $d ? ' at ' . $d['name'] : '' ) . ' — computer generated image of the front of the house', 'sizes' => '(max-width: 1140px) 100vw, 1100px', 'loading' => 'eager' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					<span class="g-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>
				</button>
				<figcaption class="showcase-caption">
					<span class="showcase-name"><?php echo esc_html( $t['name'] . ( $t['style'] ? ' · ' . $t['style'] : '' ) ); ?></span>
					<span class="showcase-note">Computer generated image. External finishes, landscaping and handing may vary by plot.</span>
				</figcaption>
			</figure>
		</div>
	</section>
	<?php endif; ?>

	<section class="section" id="overview" aria-labelledby="overview-title">
		<div class="wrap overview-grid">
			<div class="overview-copy">
				<p class="eyebrow" data-reveal>Overview</p>
				<h2 id="overview-title" class="display" data-reveal>About <?php echo esc_html( $the_name ); ?></h2>
				<?php if ( $t['summary'] ) : ?><div class="prose" data-reveal><p><?php echo esc_html( $t['summary'] ); ?></p></div><?php endif; ?>
				<?php if ( $t['highlights'] ) : ?>
					<h3 class="minor-title" data-reveal>Highlights</h3>
					<ul class="features" data-stagger><?php foreach ( $t['highlights'] as $h ) : ?><li data-reveal><?php echo esc_html( $h ); ?></li><?php endforeach; ?></ul>
				<?php endif; ?>
			</div>
			<aside class="facts" aria-label="At a glance" data-reveal style="--i:1">
				<p class="facts-title">At a glance</p>
				<?php if ( $sel ) : ?>
					<div class="panel-plot is-<?php echo esc_attr( $sel['status'] ); ?>">
						<span class="pp-no">Plot <?php echo esc_html( $sel['plot'] ); ?></span>
						<span class="badge badge-<?php echo esc_attr( $sel['status'] ); ?>"><?php echo esc_html( Premier_Data::status_label( $sel['status'] ) ); ?></span>
						<span class="pp-price"><?php echo esc_html( 'sold' === $sel['status'] ? 'Sold' : ( Premier_Data::price( $sel['price'] ) ?: 'Enquire' ) ); ?></span>
					</div>
				<?php endif; ?>
				<?php echo Premier_Render::facts( $facts ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<div class="facts-actions">
					<?php if ( $t['pdf'] ) : ?><a class="btn btn-gold btn-block" href="<?php echo esc_url( $t['pdf']['url'] ); ?>" download><?php echo $download; // phpcs:ignore WordPress.Security.EscapeOutput ?>Download floor plans (PDF)</a><?php endif; ?>
					<a class="btn btn-navy btn-block" href="#enquire"><?php echo esc_html( $sel ? 'Enquire about plot ' . $sel['plot'] : 'Book a viewing' ); ?></a>
				</div>
			</aside>
		</div>
	</section>

	<section class="section section-alt" id="floor-plans" aria-labelledby="plans-title">
		<div class="wrap">
			<header class="section-head section-head-split" data-reveal>
				<div>
					<p class="eyebrow">Layout</p>
					<h2 id="plans-title" class="display">Floor plans</h2>
				</div>
				<p class="section-intro"><?php echo $t['plans'] ? 'Select a drawing to view it larger. Room sizes are approximate and taken from the architect’s drawings.' : esc_html( 'Floor plans for ' . $the_name . ' will be published here as soon as they are ready.' ); ?></p>
			</header>
			<?php if ( $t['plans'] ) : ?>
				<div data-lightbox-group="<?php echo esc_attr( $t['name'] . ' floor plans' ); ?>">
					<div class="plan-sheets">
						<?php
						if ( ! empty( $t['plans']['ground'] ) ) {
							echo premier_plan_sheet( $t['plans']['ground'], 'Ground floor', $t['ground'], $t['name'] . ' — ground floor plan' ); // phpcs:ignore WordPress.Security.EscapeOutput
						}
						if ( ! empty( $t['plans']['first'] ) ) {
							echo premier_plan_sheet( $t['plans']['first'], 'First floor', $t['first'], $t['name'] . ' — first floor plan' ); // phpcs:ignore WordPress.Security.EscapeOutput
						}
						?>
					</div>
					<?php if ( ! empty( $t['plans']['elevations'] ) ) : ?>
						<div class="plan-elevations"><?php echo premier_plan_sheet( $t['plans']['elevations'], 'Elevations — front, sides and rear', array(), $t['name'] . ' — elevations' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
					<?php endif; ?>
				</div>
			<?php elseif ( $t['ground'] || $t['first'] ) : ?>
				<div class="plan-sheets">
					<?php foreach ( array( 'Ground floor' => $t['ground'], 'First floor' => $t['first'] ) as $label => $rows ) : ?>
						<?php if ( $rows ) : ?>
							<div class="plan-sheet" data-reveal><figcaption><span class="pr-title"><?php echo esc_html( $label ); ?></span><dl class="room-list"><?php foreach ( $rows as $r ) : ?><div><dt><?php echo esc_html( $r[0] ); ?></dt><dd><?php echo esc_html( $r[1] ?: '—' ); ?></dd></div><?php endforeach; ?></dl></figcaption></div>
						<?php endif; ?>
					<?php endforeach; ?>
				</div>
			<?php else : ?>
				<div class="sold-out" data-reveal>
					<span class="sold-out-rule" aria-hidden="true"></span>
					<p class="sold-out-title">Floor plans to follow</p>
					<p>Drawings for <?php echo esc_html( $the_name ); ?> are being finalised. Please get in touch and we will send them to you as soon as they are ready.</p>
					<a class="btn btn-navy" href="#enquire">Ask for the floor plans</a>
				</div>
			<?php endif; ?>
		</div>
	</section>

	<?php if ( $list && $d ) : ?>
	<section class="section" id="homes" aria-labelledby="homes-title">
		<div class="wrap">
			<header class="section-head section-head-split" data-reveal>
				<div>
					<p class="eyebrow">Homes for sale</p>
					<h2 id="homes-title" class="display">Availability</h2>
				</div>
				<p class="section-intro"><?php echo esc_html( 'Every ' . $t['name'] . ' home at ' . $d['name'] . ', updated as homes are reserved and sold.' ); ?></p>
			</header>
			<?php echo Premier_Render::availability( $d, array( 'plots' => $list, 'selected' => $sel ? $sel['plot'] : null ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<?php if ( $d['plots_url'] ) : ?>
				<p class="type-plan-link" data-reveal><a class="link-arrow draw" href="<?php echo esc_url( $plans_url ); ?>">See these plots on the site plan <?php echo $arrow; // phpcs:ignore WordPress.Security.EscapeOutput ?></a></p>
			<?php endif; ?>
		</div>
	</section>
	<?php endif; ?>

	<section class="section section-alt" id="downloads" aria-labelledby="downloads-title">
		<div class="wrap">
			<header class="section-head" data-reveal>
				<p class="eyebrow">Downloads</p>
				<h2 id="downloads-title" class="display">Drawings &amp; plans</h2>
			</header>
			<?php if ( $t['pdf'] ) : ?>
				<div class="download-card" data-reveal>
					<span class="download-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3v5h5"/></svg><span>PDF</span></span>
					<div class="download-body">
						<p class="download-title"><?php echo esc_html( $t['name'] ); ?> — floor plans &amp; elevations</p>
						<p class="download-meta"><?php echo esc_html( implode( ' · ', array_filter( array( 'PDF', $t['pdf']['size'], $t['pdf']['ref'] ? 'Drawing ' . $t['pdf']['ref'] : '' ) ) ) ); ?></p>
						<p class="download-text">Ground and first floor plans and elevations, with full dimensions.</p>
					</div>
					<div class="download-actions">
						<a class="btn btn-gold" href="<?php echo esc_url( $t['pdf']['url'] ); ?>" download><?php echo $download; // phpcs:ignore WordPress.Security.EscapeOutput ?>Download</a>
						<a class="btn btn-ghost" href="<?php echo esc_url( $t['pdf']['url'] ); ?>" target="_blank" rel="noopener">View PDF</a>
					</div>
				</div>
				<p class="table-note">Drawings are for guidance only and may change as the homes are built. Please ask the team to confirm details for a specific plot.</p>
			<?php else : ?>
				<p class="section-intro" data-reveal><?php echo esc_html( 'Downloadable drawings for ' . $the_name . ' will be added here soon.' ); ?></p>
			<?php endif; ?>
		</div>
	</section>

	<?php if ( $d && count( $d['house_types'] ) > 1 ) : ?>
	<section class="section" aria-labelledby="others-title">
		<div class="wrap">
			<header class="section-head section-head-split" data-reveal>
				<div>
					<p class="eyebrow">Also at <?php echo esc_html( $d['name'] ); ?></p>
					<h2 id="others-title" class="display">Other house types</h2>
				</div>
				<a class="link-arrow draw" href="<?php echo esc_url( $d['plots_url'] ?: $d['url'] ); ?>"><?php echo $d['plots_url'] ? 'View the site plan' : 'View the development'; ?> <?php echo $arrow; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			</header>
			<?php echo Premier_Render::house_type_cards( $d, array( 'exclude' => $t['id'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>
	</section>
	<?php endif; ?>

	<?php get_template_part( 'template-parts/enquire', null, array( 'title' => 'Interested in ' . ( $the_name === $t['name'] ? '' : 'the ' ) . '<em>' . esc_html( $t['name'] ) . '</em>?', 'lead' => 'Call the team or send us an email to arrange a viewing or reserve your home.', 'subject' => 'Enquiry: ' . $t['name'] . ( $sel ? ', plot ' . $sel['plot'] : '' ) . ( $d ? ' at ' . $d['name'] : '' ), 'development' => $d && 'current' === $d['stage'] ? $d['name'] : '' ) ); ?>
</main>
