<?php
/**
 * A development's Plots page (/developments/<name>/plots/): the interactive
 * site plan, house types and every plot.
 *
 * @var array $args['d'] Development data.
 */

defined( 'ABSPATH' ) || exit;

$d      = $args['d'];
$c      = $d['counts'];
$plural = fn( $n, $one, $many ) => $n . ' ' . ( 1 === (int) $n ? $one : $many );
$types  = count( $d['house_types'] );
?>
<main id="main">
	<section class="hero hero-dev hero-plots" aria-labelledby="plots-title">
		<div class="hero-media" aria-hidden="true"><?php echo Premier_Render::img( $d['site_plan'], 'full', array( 'alt' => '', 'loading' => 'eager' ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<div class="hero-shade" aria-hidden="true"></div>
		<div class="wrap hero-content">
			<a class="back-link hero-fade" style="--d:.1s" href="<?php echo esc_url( $d['url'] ); ?>">
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m5-5-5 5 5 5"/></svg><span><?php echo esc_html( $d['name'] ); ?></span>
			</a>
			<p class="eyebrow eyebrow-light hero-fade" style="--d:.25s"><?php echo esc_html( $d['name'] . ' · ' . $d['location'] ); ?></p>
			<h1 class="hero-title hero-fade" style="--d:.45s" id="plots-title">Plots</h1>
			<p class="hero-lede hero-fade" style="--d:.7s"><?php echo esc_html( 'Every home at ' . $d['name'] . ', plot by plot. Choose a home on the plan to see its house type, floor plan and availability.' ); ?></p>
			<p class="hero-chip hero-fade" style="--d:.95s"><span class="chip-dot" aria-hidden="true"></span><?php
				echo esc_html( $plural( $c['total'], 'home', 'homes' ) . ( $types ? ' · ' . $plural( $types, 'house type', 'house types' ) : '' ) . ' · ' . ( $c['available'] ? $c['available'] . ' available now' : 'Register your interest' ) . ( $d['price_from'] ? ' · From ' . Premier_Data::price( $d['price_from'] ) : '' ) );
			?></p>
		</div>
	</section>

	<section class="section plan-section" id="plan" aria-labelledby="plan-title">
		<div class="wrap">
			<header class="section-head section-head-split" data-reveal>
				<div>
					<p class="eyebrow">Interactive site plan</p>
					<h2 id="plan-title" class="display">Choose your <em>plot</em></h2>
				</div>
				<p class="section-intro">Hover over a home, or tap it on a phone, to see its house type, room sizes and every plot of that type available now. Click a home to open its full details and floor plans.</p>
			</header>
			<?php echo Premier_Render::site_plan( $d ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>
	</section>

	<?php if ( $d['house_types'] ) : ?>
	<section class="section section-alt" id="types" aria-labelledby="types-title">
		<div class="wrap">
			<header class="section-head section-head-split" data-reveal>
				<div>
					<p class="eyebrow">The homes</p>
					<h2 id="types-title" class="display">House types</h2>
				</div>
				<p class="section-intro"><?php echo esc_html( 'There ' . ( 1 === $types ? 'is 1 house type' : 'are ' . $types . ' house types' ) . ' at ' . $d['name'] . '. Room sizes are approximate and taken from the architect’s drawings.' ); ?></p>
			</header>
			<?php echo Premier_Render::house_type_cards( $d, array( 'show_on_plan' => true ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>
	</section>
	<?php endif; ?>

	<section class="section" id="homes" aria-labelledby="homes-title">
		<div class="wrap">
			<header class="section-head section-head-split" data-reveal>
				<div>
					<p class="eyebrow">Homes for sale</p>
					<h2 id="homes-title" class="display">Every plot</h2>
				</div>
				<p class="section-intro"><?php echo esc_html( 'Every plot at ' . $d['name'] . ', updated as homes are reserved and sold.' ); ?></p>
			</header>
			<?php echo Premier_Render::availability( $d ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		</div>
	</section>

	<?php get_template_part( 'template-parts/enquire', null, array( 'title' => 'Found the right <em>plot</em>?', 'lead' => 'Call the team or send us an email to arrange a viewing or reserve your home.', 'subject' => 'Plot enquiry: ' . $d['name'] ) ); ?>
</main>
