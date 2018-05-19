$(function(){
	const api="https://api.imjad.cn/cloudmusic/";
	let mySongList=[];//我的歌单

	let player=function(el,song){//播放器
		this.el=el;
		this.audio=document.getElementById("music");
		this.song=song;
		this.now=0;//现在播放位置
		this.showLyric=false;//是否显示歌词
		this.ispause-false;
	}
	let song=function(song){//当前歌曲
		this.id=song.id;
		this.src=song.src;//歌曲地址
		this.name=song.name;//歌曲名
		this.singer=song.singer;//歌手名
		this.poster=song.poster;
		this.lyric='';
		this.islove=false;//是否喜欢
		this.isadd=false;//是否添加到歌单
	}
	//播放器方法
	//控制器
	player.prototype.init=function(){//初始化播放器显示数据
		this.el.find('.music-name').text(this.song.name)
		this.el.find('.singer-name').text(this.song.singer)
		this.el.find('.time').text(this.now)
		this.el.find('#music').attr('src', this.song.src);
		$('.back').css('background-image','url('+this.song.poster+')');
		this.el.find('.poster-img').attr('src', this.song.poster);
		$(".poster").addClass("playing");
		$(".lyric").html(this.song.lyric);
		document.querySelector(".volume-progress-inner").style.width=this.audio.volume*100+'%';
		document.querySelector(".volume-progress-controller").style.left=this.audio.volume*100+'%';
	}
	player.prototype.newSong=function(songid){
		$.when(getSong(songid)).done((songInfo)=>{
			let newsong=new song(songInfo)
			this.song=newsong;
			$.when(getLyric(songid)).done(lyric=>{
				this.song.lyric=lyric.replace(/\r/g,'<br/>')
									 .replace(/\n/g,'<br/>')
									 .replace(/\r\n/g,'<br/>');
				this.init();
				let timer=this.songPlaying();
			})
		})
		
		
	}
	player.prototype.togglePause=function(){//暂停/播放
		if(!this.audio.src){
			alert('无歌曲!');
			return;
		}
		function changePause(ispause){
			if(ispause){
				$("#pause").removeClass("am-icon-pause")
				$("#pause").addClass("am-icon-play")
				$(".poster").removeClass("playing");
			}else{
				$("#pause").removeClass("am-icon-play")
				$("#pause").addClass("am-icon-pause")
				$(".poster").addClass("playing");
			}
		}
		if(this.ispause){
			this.audio.play();
			this.ispause=false;
			
		}else{
			this.audio.pause(); 
			this.ispause=true;
			
		}
		changePause(this.ispause)
		
	}
	player.prototype.prev=function(){//上一曲
		let current=this.song.id;
		mySongList.forEach((item,index)=>{
			if(item.id==current){
				if(index>0){
					this.newSong(mySongList[index-1].id);
					return;
				}else{
					alert("已经是第一首了")
					return;
				}
				
			}
		})
		return;
	}
	player.prototype.next=function(){//下一曲
		let current=this.song.id;
		mySongList.forEach((item,index)=>{
			if(item.id==current){
				if(index<mySongList.length-1){
					this.newSong(mySongList[index+1].id);
					return;
				}else{
				alert("已经是最后一首了")
				return;
			}
				
			}
		})
		return;
	}
	player.prototype.setVolume=function(vol){//设置音量
		this.audio.attr('volume', vol);
	}
	player.prototype.songPlaying=function(){//渲染进度
		if(!this.audio.src){
			this.el.find('.music-name').text('未获取到歌曲信息')
			return;
		}
		let timer=setInterval(()=>{
			let time=this.now;
			let duration=this.audio.duration;
			let minutes=parseInt(time/60);
			let seconds=parseInt(time-minutes*60);
			minutes=Math.floor(minutes/10)>0?minutes:'0'+minutes;
			seconds=Math.floor(seconds/10)>0?seconds:'0'+seconds;
			let minutes2=parseInt(duration/60);
			let seconds2=parseInt(duration-minutes2*60);
			minutes2=Math.floor(minutes2/10)>0?minutes2:'0'+minutes2;
			seconds2=Math.floor(seconds2/10)>0?seconds2:'0'+seconds2;
			duration=minutes2+':'+seconds2;
			document.querySelector(".time").innerHTML=minutes+":"+seconds+'/'+duration;
			document.querySelector(".progress-inner").style.width=this.load+"%";
			document.querySelector('.progress-controller').style.left=this.load+'%';
			if(this.load==100){
				this.next();
			}
		},500);
	}
	//其他

	//获取歌曲
	function getSong(ID){
		let defer=$.Deferred()
		let songInfo={};
		$.ajax({
			type:"GET",
			url:api,
			async:false,
			data:{type:'detail',id:ID},
			success:function(res){
				songInfo.name=res.songs[0].name;
				songInfo.id=res.songs[0].id;
				songInfo.poster=res.songs[0].al.picUrl;
				songInfo.singer=res.songs[0].ar[0].name;
			},
			error:function(xhr){
				alert('获取歌曲失败')
			}
		})
		$.ajax({
			type:"GET",
			url:api,
			async:true,
			data:{id:ID},
			success:function(res){
				songInfo.src=res.data[0].url;
				defer.resolve(songInfo)
			},
			error:function(xhr){					
				alert('获取歌曲失败')
			}
		})
		return defer.promise();
	}
	function searchSong(name){
		let defer=$.Deferred();
		$.ajax({
			type:"GET",
			url:api,
			async:true,
			crossDomain:true,
			data:{type:'search',s:name},
			success:function(res){
				mySongList=res.result.songs;

				defer.resolve(mySongList)
			},
			error:function(xhr){
				alert('查找失败')
			}
		})
		return defer.promise();
	}
	function getLyric(id){
		let defer=$.Deferred();
		$.ajax({
			type:'GET',
			url:api,
			data:{type:'lyric',id:id},
			success:function(res){
				defer.resolve(res.lrc.lyric)
			}
		})
		return defer.promise();
	}
	function renderList(list){
		let head="<tr>\
						<th>歌名</th>\
						<th>歌手</th>\
						<th>操作</th>\
				    </tr>";
		list.forEach(item=>{
			let tr='<tr class="song-li">\
						<td>'+item.name+'</td>\
						<td>'+item.ar[0].name+'</td>\
						<td><a href="javascript:;" class="am-icon-btn am-icon-play play-btn"></a></td>\
				    </tr>';
			head+=tr;
		})
		mySongList=list;
		$("#songList").html(head);
		$("#songList").children('.song-li').each(function(index, el) {
			$(el).find(".play-btn").click(function(event) {
				musicPlayer.newSong(mySongList[index].id);
			});
		});//渲染列表
	}

	
function _throttleV2(fn, delay) { // 用于函数节流，防止短时间多次调用函数
            let timer = null;
            return function() {
                let context = this; // 保存当前引用
                let args = arguments;
               
                clearTimeout(timer); // 清除上一次的定时器
                    timer = setTimeout(function() {
                        fn.apply(context, args);
                    }, delay);
               }      
}
	function bindFunctions(musicPlayer){//绑定事件
		$("#pause").click(function(){//暂停
			musicPlayer.togglePause();
		})
		$("#prev").click(function(){//上一曲
			musicPlayer.prev();
		})
		$("#next").click(function(){//下一曲
			musicPlayer.next();
		})
		$("#search-btn").click(function(){
			let name=$("#search-name").val();
			
			$.when(searchSong(name)).done(function(songs){
				renderList(songs);//渲染表格
			})
			
		})
		
		document.querySelector('.progress').onmousedown=function(e){
			musicPlayer.togglePause();
			e.preventDefault();
			e=e||window.event;
			let offsetX=this.offsetLeft+this.parentNode.offsetLeft;//进度条主题距离左边距离
			let progressLen=this.offsetWidth;//进度条长度
			
			document.onmousemove=function(e){
				
				let f=_throttleV2(()=>{
					(function(e){//拖动
						e.preventDefault();
						let passX=e.clientX-offsetX;
						if(passX<=0){
							passX=0;
						}else if(passX>=progressLen){
							passX=progressLen;
						}
						document.querySelector('.progress-controller').style.left=passX+'px';
						let load=parseInt(passX)/parseInt(progressLen)*100;//修改进度条长度
						document.querySelector(".progress-inner").style.width=load+"%";
						if(musicPlayer.audio.duration){

							musicPlayer.now=(parseInt(musicPlayer.audio.duration)*load/100);
						}else{
							console.log('暂无歌曲')
						}
					}(e))
				},80);
				f();
				
			}
			document.onmouseup=function(e2){
				e2.preventDefault();
				document.onmousemove=null;
				document.onmouseup=null;
			}
			
		}
		document.querySelector('.volume-progress').onmousedown=function(e){
			e.preventDefault();
			e=e||window.event;
			let offsetX=this.offsetLeft;//进度条主题距离左边距离
			let progressLen=this.offsetWidth;//进度条长度
			document.onmousemove=function(e){
				
				let f=_throttleV2(()=>{
					(function(e){//拖动
						e.preventDefault();
						let passX=e.clientX-offsetX;
						if(passX<=0){
							passX=0;
						}else if(passX>=progressLen){
							passX=progressLen;
						}
						document.querySelector('.volume-progress-controller').style.left=passX+'px';
						let load=parseInt(passX)/parseInt(progressLen)*100;//修改进度条长度
						document.querySelector(".volume-progress-inner").style.width=load+"%";
						
						musicPlayer.audio.volume=load/100;
						
					}(e))
				},80);
				f();
				
			}
			document.onmouseup=function(e2){
				e2.preventDefault();
				document.onmousemove=null;
				document.onmouseup=null;
			}
			
		}
		
	}

	let musicPlayer=new player($("#musicPlayer"));
	Object.defineProperty(musicPlayer,"now",{
		get:function(){
			return this.audio.currentTime;
		},
		set:function(value){		
			// console.log(value)
			this.audio.currentTime=value;
		}//获取当前时间
	})
	Object.defineProperty(musicPlayer,"load",{
		get:function(){
			return this.audio.currentTime/this.audio.duration*100;
		}
	})

	bindFunctions(musicPlayer);
})