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

@Component({
  selector: 'app-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNodeComponent implements AfterViewInit {
  @Input()
  set setNode(node: TreeNode<TreeNodeComponent>) {
    this.node = node;
    this.node.value = this;
  }

  node!: TreeNode<TreeNodeComponent>;

  @Input()
  set height(h: number) {
    this.elHeight = h;
    this.calculateStyling();
  }

  elHeight!: number;

  @ViewChild('containerEl')
  containerEl!: ElementRef;

  constructor(private renderer: Renderer2, private nodeService: NodeService, private elRef: ElementRef, private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.calculateStyling();
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
