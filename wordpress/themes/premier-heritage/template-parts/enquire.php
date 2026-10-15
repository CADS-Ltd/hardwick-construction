<?php
/**
 * Navy enquiry band.
 *
 * @var array $args title (may contain <em>), lead, subject
 */

defined( 'ABSPATH' ) || exit;

$c = premier_company();
?>
<section class="section section-navy enquire" id="enquire" aria-labelledby="enquire-title">
	<div class="wrap enquire-inner" data-reveal>
		<p class="eyebrow eyebrow-light">Enquiries</p>
		<h2 id="enquire-title" class="display"><?php echo wp_kses( $args['title'] ?? 'Get in touch', array( 'em' => array() ) ); ?></h2>
		<p class="lead"><?php echo esc_html( $args['lead'] ?? '' ); ?></p>
		<div class="enquire-actions">
			<?php if ( $c['phone'] ) : ?><a class="btn btn-gold" href="<?php echo esc_attr( premier_tel( $c['phone'] ) ); ?>"><?php echo esc_html( $c['phone'] ); ?></a><?php endif; ?>
			<a class="btn btn-ghost-light" href="<?php echo esc_attr( 'mailto:' . $c['email'] . '?subject=' . rawurlencode( $args['subject'] ?? 'Enquiry from the website' ) ); ?>">Email an enquiry</a>
		</div>
		<?php if ( $c['mobile'] ) : ?><p class="enquire-alt">Mobile <a class="draw" href="<?php echo esc_attr( premier_tel( $c['mobile'] ) ); ?>"><?php echo esc_html( $c['mobile'] ); ?></a></p><?php endif; ?>
	</div>
</section>
