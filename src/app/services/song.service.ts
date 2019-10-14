import { Injectable, Inject } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { ServicesModule, API_CONFIG } from './services.module';
import { SongUrl, Song, Lyric } from './data-types/common.types';



@Injectable({
  providedIn: ServicesModule
})
export class SongService {

  constructor(private http: HttpClient, @Inject(API_CONFIG) private uri: string) { }

  getSongUrl(ids: string): Observable<SongUrl[]> {
    const params = new HttpParams().set('id', ids);
    return this.http.get(`${this.uri}/song/url`, { params }).pipe(
      map((res: { data: SongUrl[] }) => res.data)
    );
  }

  getSongList(songs: Song | Song[]): Observable<Song[]> {
    const songArr = Array.isArray(songs) ? songs.slice() : [songs];
    const ids = songArr.map(item => item.id).join(',');
    return this.getSongUrl(ids).pipe((map(urls => this.generateSongList(songArr, urls))));
  }

  private generateSongList(songs: Song[], urls: SongUrl[]): Song[] {
    const result = [];
    songs.forEach(song => {
      const url = urls.find(songUrl => songUrl.id === song.id).url;
      if (url) {
        result.push({ ...song, url });
      }
    });
    return result;
  }

  getLyric(id: number): Observable<Lyric> {
    const params = new HttpParams().set('id', id.toString());
    return this.http.get(`${this.uri}/lyric`, { params }).pipe(map((res: { [key: string]: { lyric: string } }) => {
      try {
        return {
          lyric: res.lrc.lyric,
          tlyric: res.tlyric.lyric
        };
      } catch (err) {
        return {
          lyric: '',
          tlyric: '',
        };
      }
    }));
  }

}
