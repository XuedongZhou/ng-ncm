import { Injectable } from '@angular/core';
import { AppStoreModule } from './index';
import { Store, select } from '@ngrx/store';
import { Song } from '../services/data-types/common.types';
import { SetSongList, SetPlayList, SetCurrentIndex, SetCurrentAction } from './actions/player.action';
import { shuffle, findIndex } from '../utils/array';
import { PlayState, CurrentActions } from './reducers/player.reducer';
import { MemberState, ModalTypes } from './reducers/member.reducer';
import { SetModalVisible, SetModalType } from './actions/member.action';

@Injectable({
  providedIn: AppStoreModule
})
export class BatchActionsService {
  private playerState: PlayState;
  private memberState: MemberState;

  constructor(private store$: Store<AppStoreModule>) {
    this.store$.pipe(select('player')).subscribe(res => this.playerState = res);
    this.store$.pipe(select('member')).subscribe(res => this.memberState = res);
  }

  // 播放列表
  selectPlayList({ list, index }: { list: Song[], index: number }) {
    this.store$.dispatch(SetSongList({ songList: list }));

    let trueIndex = index;
    let trueList = list.slice();

    if (this.playerState.playMode.type === 'random') {
      trueList = shuffle(list || []);
      trueIndex = findIndex(trueList, list[trueIndex]);
    }

    this.store$.dispatch(SetPlayList({ playList: trueList }));
    this.store$.dispatch(SetCurrentIndex({ currentIndex: trueIndex }));
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Play }));
  }

  // 添加歌曲
  insertSong(song: Song, isPlay: boolean) {
    const songList = this.playerState.songList.slice();
    const playList = this.playerState.playList.slice();
    let insertIndex = this.playerState.currentIndex;
    const pIndex = findIndex(playList, song);
    if (pIndex > -1) {
      if (isPlay) {
        insertIndex = pIndex;
      }
    } else {
      songList.push(song);
      playList.push(song);
      if (isPlay) {
        insertIndex = songList.length - 1;
      }
      this.store$.dispatch(SetSongList({ songList }));
      this.store$.dispatch(SetPlayList({ playList }));
    }

    if (insertIndex !== this.playerState.currentIndex) {
      this.store$.dispatch(SetCurrentIndex({ currentIndex: insertIndex }));
      this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Play }));
    } else {
      this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Add }));
    }
  }

  // 添加多首歌曲
  insertSongs(songs: Song[]) {
    const songList = this.playerState.songList.slice();
    const playList = this.playerState.playList.slice();
    songs.forEach(item => {
      const pIndex = findIndex(playList, item);
      if (pIndex === -1) {
        songList.push(item);
        playList.push(item);
      }
    });
    this.store$.dispatch(SetSongList({ songList }));
    this.store$.dispatch(SetPlayList({ playList }));
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Add }));
  }

  // 删除歌曲
  deleteSong(song: Song) {
    const songList = this.playerState.songList.slice();
    const playList = this.playerState.playList.slice();
    let currentIndex = this.playerState.currentIndex;
    const sIndex = findIndex(songList, song);
    songList.splice(sIndex, 1);
    const pIndex = findIndex(playList, song);
    playList.splice(pIndex, 1);

    if (currentIndex > pIndex || currentIndex === playList.length) {
      currentIndex--;
    }

    this.store$.dispatch(SetSongList({ songList }));
    this.store$.dispatch(SetPlayList({ playList }));
    this.store$.dispatch(SetCurrentIndex({ currentIndex }));
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Delete }));
  }

  // 清空歌曲
  clearSongList() {
    this.store$.dispatch(SetSongList({ songList: [] }));
    this.store$.dispatch(SetPlayList({ playList: [] }));
    this.store$.dispatch(SetCurrentIndex({ currentIndex: -1 }));
    this.store$.dispatch(SetCurrentAction({ currentAction: CurrentActions.Clear }));
  }

  // 收藏歌曲
  likeSong(id: string) {
    // this.store$.dispatch(SetModalType({ modalType: ModalTypes.Like }));
    // this.store$.dispatch(SetLikeId({ id }));
  }

  // 会员弹窗显示隐藏
  controlModal(visibel = true, modalType?: ModalTypes) {
    if (modalType) {
      this.store$.dispatch(SetModalType({ modalType }));
    }
    this.store$.dispatch(SetModalVisible({ modalVisible: visibel }));
  }
}



