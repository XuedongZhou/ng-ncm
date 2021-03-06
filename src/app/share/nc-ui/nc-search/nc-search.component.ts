import {
  Component,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { pluck, debounceTime, distinctUntilChanged } from 'rxjs/internal/operators';
import { isEmptyObject } from 'src/app/utils/tools';
import { SearchResult } from 'src/app/services/data-types/common.types';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { NcSearchPanelComponent } from './nc-search-panel/nc-search-panel.component';

@Component({
  selector: 'app-nc-search',
  templateUrl: './nc-search.component.html',
  styleUrls: ['./nc-search.component.less']
})
export class NcSearchComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() customView: TemplateRef<any>;
  @Input() searchResult: SearchResult;
  @Input() connectedRef: ElementRef;
  @Output() searhChange = new EventEmitter<string>();

  private overlayRef: OverlayRef;
  @ViewChild('search', { static: false }) private searchRef: ElementRef;
  @ViewChild('nzInput', { static: false }) private nzInput: ElementRef;
  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchResult && !changes.searchResult.firstChange) {
      if (!isEmptyObject(this.searchResult)) {
        this.showOverlayPanel();
      } else {
        this.showOverlayPanel();
      }
    }
  }

  ngAfterViewInit(): void {
    fromEvent(this.nzInput.nativeElement, 'input').pipe(
      debounceTime(300),
      distinctUntilChanged(),
      pluck('target', 'value')
    ).subscribe((val: string) => {
      this.searhChange.emit(val);
    });
  }

  onFocus() {
    if (this.searchResult && !isEmptyObject(this.searchResult)) {
      this.showOverlayPanel();
    }
  }

  onBlur() {
    this.hideOverlayPanel();
  }

  showOverlayPanel() {
    this.hideOverlayPanel();
    const positionStrategy = this.overlay.position().flexibleConnectedTo(this.connectedRef || this.searchRef).withPositions([{
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top'
    }]).withLockedPosition(true);
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
    const panelPortal = new ComponentPortal(NcSearchPanelComponent, this.viewContainerRef);
    const panelRef = this.overlayRef.attach(panelPortal);
    panelRef.instance.searchResult = this.searchResult;
    this.overlayRef.backdropClick().subscribe(() => {
      this.hideOverlayPanel();
    });
  }

  hideOverlayPanel() {
    if (this.overlayRef && this.overlayRef.hasAttached) {
      this.overlayRef.dispose();
    }

  }

}
