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
			<?php
			$subject = $args['subject'] ?? 'Enquiry from the website';
			$enquiry = class_exists( 'Premier_Data' ) ? Premier_Data::enquiry_url( $args['development'] ?? '', $subject ) : 'mailto:' . $c['email'] . '?subject=' . rawurlencode( $subject );
			?>
			<a class="btn btn-ghost-light" href="<?php echo esc_attr( $enquiry ); ?>"><?php echo str_starts_with( $enquiry, 'mailto:' ) ? 'Email an enquiry' : 'Send an enquiry'; ?></a>
		</div>
		<?php if ( $c['mobile'] ) : ?><p class="enquire-alt">Mobile <a class="draw" href="<?php echo esc_attr( premier_tel( $c['mobile'] ) ); ?>"><?php echo esc_html( $c['mobile'] ); ?></a></p><?php endif; ?>
	</div>
</section>
