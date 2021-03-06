<?php mc_template_part('header_admin'); ?>
<div class="container-admin">
	<div class="home-main">
		<div class="row form-group">
			<label>填写批量抓取的ISBN,以小数点分隔</label>
			<textarea id="isbn-batch" class="form-control" rows="6"></textarea>
<form id="add-pro-form" action="<?php echo U('custom/perform/publish_pro_ajax'); ?>">
<input type="hidden" name="fmimg[]">
<input type="hidden" name="title">
<input type="hidden" name="isbn">
<input type="hidden" name="price" value="0">
<input type="hidden" name="keywords">
<input type="hidden" name="description">
<?php $parameter = M('option')->where("meta_key='parameter' AND type='pro'")->select(); if($parameter) : foreach($parameter as $par) : ?>
<input type="hidden" class="input-para" name="pro-parameter[<?php echo $par['id']; ?>][1][name]" data-para="<?php echo $par['meta_value']; ?>">
<?php endforeach; endif; ?>
<input type="hidden" name="content">
<div class="form-group">
	<label>选择分类</label>
	<select multiple class="form-control" name="term">
		<?php $terms = M('page')->where('type="term_pro"')->order('id desc')->select(); ?>
		<?php foreach($terms as $val) : ?>
		<option value="<?php echo $val['id']; ?>">
			<?php echo $val['title']; ?>
		</option>
		<?php endforeach; ?>
	</select>
</div>
<?php echo W("Links/edit"); ?>
</form>
			<button id="start-grab" class="btn btn-default" type="button">开始抓取</button>
		</div>
		<p id="global-status"></p>
		<ul id="task-progress" class="list-unstyled">
			<li style="display:none;">
				<span class="isbn-span">9780374351014</span>
				<img style="display:none;" class="grab-st grab-st-doing" src="http://cdn.qibaowu.cn/assets/crx/img/loading.gif">
				<i style="display:none;" class="grab-st grab-st-done glyphicon glyphicon-ok"></i>
				<i style="display:none;" class="grab-st grab-st-fail glyphicon glyphicon-remove"></i>
				<span class="msg-span"></span>
			</li>
		</ul>
		<p id="if-no-plugin">请使用Chrome浏览器并安装<a href="http://cdn.qibaowu.cn/assets/crx/grabook.crx?v=0.1">抓取插件</a></p>
	</div>
</div>
<?php mc_template_part('footer_admin'); ?>