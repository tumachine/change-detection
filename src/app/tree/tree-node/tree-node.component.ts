import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  Input, OnDestroy, OnInit,
  Renderer2,
  ViewChild, ViewRef,
} from '@angular/core';
import { NodeService, TreeNodeAsComponent } from '../../node.service';
import { animate, AnimationBuilder, state, style, transition, trigger } from '@angular/animations';
import { NgControl } from '@angular/forms';
import { ViewFlags } from '@angular/compiler/src/core';

@Component({
  selector: 'app-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
})
export class TreeNodeComponent implements AfterViewInit, AfterContentChecked {
  @Input()
  set setNode(node: TreeNodeAsComponent) {
    this.node = node;
    this.node.value.component = this;
  }

  node!: TreeNodeAsComponent;

  @Input()
  set height(h: number) {
    this.elHeight = h;
    this.calculateStyling();
  }

  elHeight!: number;

  @ViewChild('containerEl')
  containerEl!: ElementRef;

  @ViewChild('innerNode')
  innerNode!: ElementRef;

  constructor(
    private renderer: Renderer2,
    private nodeService: NodeService,
    private elRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    private builder: AnimationBuilder,
  ) {}

  ngAfterViewInit(): void {
    this.calculateStyling();
  }

  ngAfterContentChecked(): void {
    this.nodeService.onCheck(this.node);
  }

  onRemove(): void {
    const animation = this.builder.build([
      style({ 'flex-grow': 1}),
      animate(200, style({ 'flex-grow': 0 }))
    ]);
    const player = animation.create(this.elRef.nativeElement);
    player.play();
  }

  onCurrentChange(value: string): void {
    this.renderer.setStyle(this.elRef.nativeElement, 'flex', value);
  }

  markForCheck(): void {
    this.cdRef.markForCheck();
  }

  shakeAnimation(): void {
    const animation = this.builder.build([
      // style({ width: '100%'}),
      // animate(200, style({ width: '0%' })),
      // animate(200, style({ width: '100%' })),
      animate('0.1s', style({ transform: 'rotate(2deg)' })),
      animate('0.1s', style({ transform: 'rotate(-2deg)' })),
      animate('0.1s', style({ transform: 'rotate(2deg)' })),
      // animate('0.1s', style({ transform: 'rotate(0)', background: 'white' })),
      animate('0.1s', style({ transform: 'rotate(0)' })),
    ]);
    const player = animation.create(this.innerNode.nativeElement);
    player.play();
  }

  click(event: MouseEvent): void {
    this.nodeService.changeCurrentNode(this.node);
    this.shakeAnimation();
    this.nodeService.startRecording();
    setTimeout(() => {
      this.nodeService.stopRecording();
      this.nodeService.showChecked();
    }, 50);
  }

  calculateStyling(): void {
    if (this.elRef) {
      this.renderer.setStyle(this.elRef.nativeElement, 'height', `${this.elHeight}px`);
    }

    if (this.containerEl) {
      this.renderer.setStyle(this.containerEl.nativeElement, 'margin-top', `${this.elHeight}px`);
    }
  }
}
