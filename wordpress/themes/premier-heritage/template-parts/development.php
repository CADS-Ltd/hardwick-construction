<?php
/**
 * Development page: hero, overview, availability, gallery, location, enquiry.
 *
 * @var array $args['d'] Development data from Premier_Data::development().
 */

defined( 'ABSPATH' ) || exit;

$d     = $args['d'];
$c     = $d['counts'];
$done  = 'completed' === $d['stage'] || ! $d['plots'];
$arrow = Premier_Render::ARROW;
$plural = fn( $n, $one, $many ) => $n . ' ' . ( 1 === (int) $n ? $one : $many );
$home  = home_url( '/' );

$facts = array( array( 'Location', $d['location'] ) );
if ( $done ) {
	$facts[] = array( 'Status', trim( 'Completed ' . $d['completed'] ) );
	$facts[] = array( 'Availability', 'All homes sold' );
} else {
	$facts[] = array( 'Homes', $plural( $c['total'], 'home', 'homes' ) . ( $d['bed_range'] ? ' · ' . $d['bed_range'] : '' ) );
	$facts[] = array( 'Prices from', $d['price_from'] ? Premier_Data::price( $d['price_from'] ) : 'Enquire' );
	$facts[] = array( 'Available now', (string) $c['available'] );
}
if ( $d['postcode'] ) {
	$facts[] = array( 'Postcode', $d['postcode'] );
}
$others = array_values( array_filter( array_merge( Premier_Data::developments( 'current' ), Premier_Data::developments( 'completed' ) ), fn( $o ) => $o['id'] !== $d['id'] ) );
$others = array_slice( $others, 0, 3 );
$images = array_values( array_filter( array_merge( array( $d['hero'] ), $d['gallery'] ) ) );
?>
<main id="main">
	<section class="hero hero-dev" aria-labelledby="dev-name">
		<div class="hero-media" aria-hidden="true"><?php echo Premier_Render::img( $d['hero'], 'full', array( 'alt' => '', 'loading' => 'eager', 'fetchpriority' => 'high' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<div class="hero-shade" aria-hidden="true"></div>
		<div class="wrap hero-content">
			<a class="back-link hero-fade" style="--d:.1s" href="<?php echo esc_url( $home . ( $done ? '#completed' : '#current' ) ); ?>">
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m5-5-5 5 5 5"/></svg><span>All developments</span>
			</a>
			<p class="eyebrow eyebrow-light hero-fade" style="--d:.25s"><?php echo esc_html( $d['location'] ); ?></p>
			<h1 class="hero-title hero-fade" style="--d:.45s" id="dev-name"><?php echo esc_html( $d['name'] ); ?></h1>
			<?php if ( $d['headline'] ) : ?><p class="hero-lede hero-fade" style="--d:.7s"><?php echo esc_html( $d['headline'] ); ?></p><?php endif; ?>
			<p class="hero-chip hero-fade" style="--d:.95s"><span class="chip-dot<?php echo $done ? ' is-done' : ''; ?>" aria-hidden="true"></span><?php
				if ( $done ) {
					echo esc_html( trim( 'Completed ' . $d['completed'] ) . ' · All homes sold' );
				} else {
					echo esc_html( 'Now selling · ' . ( $c['available'] ? $plural( $c['available'], 'home', 'homes' ) . ' available' : 'Register your interest' ) . ( $d['price_from'] ? ' · From ' . Premier_Data::price( $d['price_from'] ) : '' ) );
				}
			?></p>
		</div>
	</section>

	<nav class="subnav" aria-label="On this page">
		<div class="wrap subnav-inner">
			<span class="subnav-name" aria-hidden="true"><?php echo esc_html( $d['name'] ); ?></span>
			<ul class="subnav-links">
				<li><a href="#overview" data-sub>Overview</a></li>
				<li><a href="#homes" data-sub>Homes</a></li>
				<?php if ( $images ) : ?><li><a href="#gallery" data-sub>Gallery</a></li><?php endif; ?>
				<li><a href="#location" data-sub>Location</a></li>
			</ul>
			<a class="btn btn-navy btn-sm subnav-cta" href="#enquire">Enquire</a>
		</div>
	</nav>

	<section class="section" id="overview" aria-labelledby="overview-title">
		<div class="wrap overview-grid">
			<div class="overview-copy">
				<p class="eyebrow" data-reveal>Overview</p>
				<h2 id="overview-title" class="display" data-reveal>About the development</h2>
				<div class="prose" data-reveal><?php echo wp_kses_post( $d['description'] ?: wpautop( $d['summary'] ) ); ?></div>
				<?php if ( $d['features'] ) : ?>
					<h3 class="minor-title" data-reveal>Key features</h3>
					<ul class="features" data-stagger><?php foreach ( $d['features'] as $f ) : ?><li data-reveal><?php echo esc_html( $f ); ?></li><?php endforeach; ?></ul>
				<?php endif; ?>
			</div>
			<aside class="facts" aria-label="At a glance" data-reveal style="--i:1">
				<p class="facts-title">At a glance</p>
				<?php echo Premier_Render::facts( $facts ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<a class="btn btn-gold btn-block" href="#enquire"><?php echo $done ? 'Ask about new homes' : 'Book a viewing'; ?></a>
			</aside>
		</div>
	</section>

	<section class="section section-alt" id="homes" aria-labelledby="homes-title">
		<div class="wrap">
			<header class="section-head section-head-split" data-reveal>
				<div>
					<p class="eyebrow"><?php echo $done ? 'The homes' : 'Homes for sale'; ?></p>
					<h2 id="homes-title" class="display">Availability</h2>
				</div>
				<p class="section-intro"><?php echo esc_html( $done ? 'This development has been completed and every home is now sold.' : 'Every plot at ' . $d['name'] . ', updated as homes are reserved and sold. Contact us to arrange a viewing or reserve a home.' ); ?></p>
			</header>
			<?php if ( $done ) : ?>
				<div class="sold-out" data-reveal>
					<span class="sold-out-rule" aria-hidden="true"></span>
					<p class="eyebrow"><?php echo esc_html( $d['name'] ); ?></p>
					<p class="sold-out-title"><?php echo esc_html( trim( 'Completed ' . $d['completed'] ) . ' — all homes sold' ); ?></p>
					<p>Thank you to everyone who chose a home at <?php echo esc_html( $d['name'] ); ?>. Take a look at our current developments to find homes available now.</p>
					<a class="btn btn-navy" href="<?php echo esc_url( $home . '#current' ); ?>">View current developments</a>
				</div>
			<?php else : ?>
				<?php echo Premier_Render::plan_cta( $d ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<?php echo Premier_Render::availability( $d ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<?php endif; ?>
		</div>
	</section>

	<?php if ( $images ) : ?>
	<section class="section" id="gallery" aria-labelledby="gallery-title">
		<div class="wrap">
			<header class="section-head" data-reveal>
				<p class="eyebrow">Gallery</p>
				<h2 id="gallery-title" class="display">Inside &amp; out</h2>
			</header>
			<?php echo Premier_Render::gallery( $images, $d['name'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>
	</section>
	<?php endif; ?>

	<section class="section section-alt" id="location" aria-labelledby="location-title">
		<div class="wrap location-grid">
			<div data-reveal>
				<p class="eyebrow">Location</p>
				<h2 id="location-title" class="display">Finding <?php echo esc_html( $d['name'] ); ?></h2>
				<p class="lead"><?php echo esc_html( $d['name'] . ' is located in ' . $d['location'] . '.' . ( $d['postcode'] ? ' Use the postcode ' . $d['postcode'] . ' for satellite navigation.' : '' ) ); ?></p>
				<a class="link-arrow draw" href="<?php echo esc_url( 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode( $d['map_query'] ) ); ?>" target="_blank" rel="noopener">Open in Google Maps <?php echo $arrow; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			</div>
			<div class="loc-card" data-reveal style="--i:1">
				<svg class="loc-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>
				<p class="loc-label">Development address</p>
				<p class="loc-place"><?php echo esc_html( $d['name'] . ', ' . $d['location'] ); ?></p>
				<?php if ( $d['postcode'] ) : ?><p class="loc-postcode"><?php echo esc_html( $d['postcode'] ); ?></p><?php endif; ?>
				<p class="loc-note"><?php echo $done ? 'All homes are now privately owned — please respect residents’ privacy.' : 'Viewings strictly by appointment.'; ?></p>
			</div>
		</div>
	</section>

	<?php get_template_part( 'template-parts/enquire', null, array( 'title' => $done ? 'Looking for a home like <em>' . esc_html( $d['name'] ) . '</em>?' : 'Interested in <em>' . esc_html( $d['name'] ) . '</em>?', 'lead' => $done ? 'Every home here is now sold, but new developments are always in the pipeline. Call or email to hear about them first.' : 'Call the team or send us an email to arrange a viewing or reserve a plot.', 'subject' => 'Enquiry: ' . $d['name'] ) ); ?>

	<?php if ( $others ) : ?>
	<section class="section others" aria-labelledby="others-title">
		<div class="wrap">
			<header class="section-head section-head-split" data-reveal>
				<div>
					<p class="eyebrow">Also by <?php echo esc_html( preg_replace( '/\s*\(.*\)$/', '', premier_company()['name'] ) ); ?></p>
					<h2 id="others-title" class="display">Other developments</h2>
				</div>
				<a class="link-arrow draw" href="<?php echo esc_url( $home . '#current' ); ?>">View all developments <?php echo $arrow; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			</header>
			<?php echo Premier_Render::development_grid( $others, 'others-grid' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>
	</section>
	<?php endif; ?>
</main>
