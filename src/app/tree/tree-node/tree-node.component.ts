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
import { NodeService, TreeNodeAsComponent, TreeNodeValueProps } from '../../node.service';
import {
  animate,
  AnimationBuilder,
  AnimationMetadata,
  AnimationPlayer, group, query,
  style,
} from '@angular/animations';
import { createRepeatingLine } from '../../utils';

interface CustomAnimation {
  duration: number;
  player: AnimationPlayer;
}

const treeNodeBackgroundStyles = {
  onPush: { background: '#41B619' },
  default: { background: '#0351C1' },
};

const treeNodeForegroundStyles = {
  none: { background: 'transparent' },
  current: { background: createRepeatingLine(45, 35, 'transparent', 'white') },
  checkedOnPush: { background: createRepeatingLine(45, 35, 'transparent', '#70E852') },
  checkedDefault: { background: createRepeatingLine(45, 35, 'transparent', '#5199FF') },
};

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
    this.setNodeStyle(this.node.value.props);
    this.node.value$.subscribe(v => this.setNodeStyle(v.props));
  }

  styleState = {
    background: {},
    foreground: {},
  };

  node!: TreeNodeAsComponent;

  // Animations
  animationShake!: CustomAnimation;
  animationDelete!: CustomAnimation;
  animationDeleteShrink!: CustomAnimation;
  animationChangeOnPush!: CustomAnimation;
  animationChangeDefault!: CustomAnimation;

  @Input()
  set height(h: number) {
    this.elHeight = h;
    this.calculateStyling();
  }

  elHeight!: number;

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

    this.animationShake = this.createAnimationPlayer(this.innerNode, [
      animate('0.1s', style({ transform: 'rotate(2deg)' })),
      animate('0.1s', style({ transform: 'rotate(-2deg)' })),
      animate('0.1s', style({ transform: 'rotate(2deg)' })),
      animate('0.1s', style({ transform: 'rotate(0)' })),
    ], 400);

    this.animationDeleteShrink = this.createAnimationPlayer(this.elRef, [
      group([
        animate('0.4s', style({ 'flex-grow': 0, transform: 'rotate(180deg)', opacity: 0 })),
        query('.node-info-inner-foreground', animate('0.4s', style({ background: 'red' }))),
      ])
    ], 500);

    this.animationChangeOnPush = this.createAnimationPlayer(this.innerNode, [
      animate('0.5s', style({ transform: 'rotate(360deg)', ...treeNodeBackgroundStyles.onPush })),
    ], 500);

    this.animationChangeDefault = this.createAnimationPlayer(this.innerNode, [
      animate('0.5s', style({ transform: 'rotate(360deg)', ...treeNodeBackgroundStyles.default })),
    ], 500);
  }

  ngAfterContentChecked(): void {
    this.nodeService.onCheck(this.node);
  }

  setNodeStyle(props: TreeNodeValueProps): void {
    this.calculateBackground(props);
    this.calculateForeground(props);
  }

  calculateForeground(props: TreeNodeValueProps): any {
    let foregroundStyle = treeNodeForegroundStyles.none;
    if (props.current) {
      foregroundStyle = treeNodeForegroundStyles.current;
    } else if (props.checked) {
      if (props.onPush) {
        foregroundStyle = treeNodeForegroundStyles.checkedOnPush;
      } else {
        foregroundStyle = treeNodeForegroundStyles.checkedDefault;
      }
    }
    this.styleState.foreground = foregroundStyle;
  }

  calculateBackground(props: TreeNodeValueProps): void {
    this.styleState.background = props.onPush ? treeNodeBackgroundStyles.onPush : treeNodeBackgroundStyles.default;
  }

  markForCheck(): void {
    this.cdRef.markForCheck();
  }

  private createAnimationPlayer(element: ElementRef, metadata: AnimationMetadata | AnimationMetadata[], duration: number): CustomAnimation {
    const player = this.builder.build(metadata).create(element.nativeElement);
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
  }
}
