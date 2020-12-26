import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { NodeService } from '../../node.service';
import { TreeNode } from '../../node';
import { animate, AnimationBuilder, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNodeComponent implements AfterViewInit {
  @Input()
  set setNode(node: TreeNode) {
    this.node = node;
    this.node.value.component = this;
  }

  node!: TreeNode;

  @Input()
  set height(h: number) {
    this.elHeight = h;
    this.calculateStyling();
  }

  elHeight!: number;

  @ViewChild('containerEl')
  containerEl!: ElementRef;

  constructor(private renderer: Renderer2, private nodeService: NodeService, private elRef: ElementRef, private cdRef: ChangeDetectorRef, private builder: AnimationBuilder) {}

  ngAfterViewInit(): void {
    this.calculateStyling();
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

  click(event: MouseEvent): void {
    this.nodeService.changeCurrentNode(this.node);
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
