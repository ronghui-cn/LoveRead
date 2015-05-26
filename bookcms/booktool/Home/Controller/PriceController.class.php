<?php
namespace Home\Controller;
use Think\Controller;
class PriceController extends Controller {
    public function index($page=1){
    	if(!is_numeric($page)){
    		$page = 1;
    	}
    	$items = M('price_trace')->page($page,20)->select();
    	$count = M('price_trace')->count();
    	$this->assign('items', $items);
    	$this->assign('count', $count);
    	$this->assign('cpage', $page);
        $this->display();
    }
    public function set_urls(){
    	if(bt_is_admin()){
    		$src_url = I('post.surl');
    		$dst_urls = I('post.durls');
    		if($src_url && $dst_urls){
    			$json = json_encode($dst_urls);
    			$data = array('meta_value'=>$json);
    			$old = M('price_trace')->where(array('meta_key'=>$src_url))->getField('meta_value');
    			if($old != ''){
    				M('price_trace')->where(array('meta_key'=>$src_url))->save($data);
    			}else{
    				$data['meta_key'] = $src_url;
    				M('price_trace')->data($data)->add();
    			}
    			$ret = array('ret'=>true, 'msg'=>'设置成功');
    		}else{
    			$ret = array('ret'=>false, 'msg'=>'填写不完整');
    		}
    	}else{
    		$ret = array('ret'=>false, 'msg'=>'没有权限');
    	}
    	$this->ajaxReturn($ret);
    }
    public function get_urls(){
    	if(bt_is_admin()){
    		$src_url = I('param.surl');
    		$json = M('price_trace')->where(array('meta_key'=>$src_url))->getField('meta_value');
    		$dst_urls = json_decode($json, true);
    		$ret = array('ret'=>true, 'msg'=>$dst_urls);
    	}else{
    		$ret = array('ret'=>false, 'msg'=>'没有权限');
    	}
    	$this->ajaxReturn($ret);
    }
    public function del_urls(){
        if(bt_is_admin()){
        	$src_url = I('param.surl');
        	$num = M('price_trace')->where(array('meta_key'=>$src_url))->delete();
        	if($num){
        		$ret = array('ret'=>true, 'msg'=>'删除成功');
        	}else{
        		$ret = array('ret'=>false, 'msg'=>'删除失败');
        	}
    	}else{
    		$ret = array('ret'=>false, 'msg'=>'没有权限');
    	}
    	$this->ajaxReturn($ret);
    }
}