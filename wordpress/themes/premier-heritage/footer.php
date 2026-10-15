<?php
/**
 * Site footer. Replaced by an Elementor Pro Theme Builder footer when one is assigned.
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'footer' ) ) :
	$c = premier_company();
	?>
	<footer class="site-footer">
		<div class="wrap footer-grid">
			<div class="footer-brand">
				<?php echo premier_wordmark( true ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				<?php if ( $c['strapline'] ) : ?><p><?php echo esc_html( $c['strapline'] ); ?></p><?php endif; ?>
			</div>
			<div>
				<h2 class="footer-title">Visit</h2>
				<address><?php echo implode( '<br>', array_map( 'esc_html', $c['address'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></address>
			</div>
			<div>
				<h2 class="footer-title">Call or email</h2>
				<ul class="footer-links">
					<?php if ( $c['phone'] ) : ?><li>Office <a class="draw" href="<?php echo esc_attr( premier_tel( $c['phone'] ) ); ?>"><?php echo esc_html( $c['phone'] ); ?></a></li><?php endif; ?>
					<?php if ( $c['mobile'] ) : ?><li>Mobile <a class="draw" href="<?php echo esc_attr( premier_tel( $c['mobile'] ) ); ?>"><?php echo esc_html( $c['mobile'] ); ?></a></li><?php endif; ?>
					<?php if ( $c['email'] ) : ?><li><a class="draw" href="mailto:<?php echo esc_attr( $c['email'] ); ?>"><?php echo esc_html( $c['email'] ); ?></a></li><?php endif; ?>
				</ul>
			</div>
			<div>
				<h2 class="footer-title">Explore</h2>
				<ul class="footer-links"><?php echo premier_menu_links( 'footer', 'draw', true ); // phpcs:ignore WordPress.Security.EscapeOutput ?></ul>
			</div>
		</div>
		<div class="wrap footer-base">
			<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( $c['name'] ); ?>. All rights reserved.</p>
			<?php if ( get_privacy_policy_url() ) : ?><p><a class="draw" href="<?php echo esc_url( get_privacy_policy_url() ); ?>">Privacy policy</a></p><?php endif; ?>
		</div>
	</footer>
	<?php
endif;
?>

<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" hidden>
	<button class="lb-btn lb-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
	<button class="lb-btn lb-prev" type="button" aria-label="Previous image"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
	<figure class="lb-figure"><img id="lb-img" src="" alt=""><figcaption id="lb-cap"></figcaption></figure>
	<button class="lb-btn lb-next" type="button" aria-label="Next image"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
</div>

<?php wp_footer(); ?>
</body>
</html>
