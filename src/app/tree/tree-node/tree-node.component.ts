import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NodeService, TreeNodeAsComponent } from '../../node.service';
import { animate, AnimationBuilder, AnimationMetadata, AnimationPlayer, style } from '@angular/animations';

interface CustomAnimation {
  duration: number;
  player: AnimationPlayer;
}

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

  // Animations
  animationShake!: CustomAnimation;
  animationDelete!: CustomAnimation;

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

    this.animationShake = this.createAnimationPlayer([
      animate('0.1s', style({ transform: 'rotate(2deg)' })),
      animate('0.1s', style({ transform: 'rotate(-2deg)' })),
      animate('0.1s', style({ transform: 'rotate(2deg)' })),
      animate('0.1s', style({ transform: 'rotate(0)' })),
    ], 400);

    this.animationDelete = this.createAnimationPlayer([
      animate('0.5s', style({ 'flex-shrink': 0 }))
    ], 500);
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

  private createAnimationPlayer(metadata: AnimationMetadata | AnimationMetadata[], duration: number): CustomAnimation {
    const player = this.builder.build(metadata).create(this.innerNode.nativeElement);
    return { player, duration };
  }

  click(event: MouseEvent): void {
    this.nodeService.changeCurrentNode(this.node);
    this.animationShake.player.play();
    this.nodeService.record(() => this.nodeService.showChecked());
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
