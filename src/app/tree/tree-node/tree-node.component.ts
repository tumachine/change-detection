import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { TreeNode } from '../tree-node';
import { NodeService } from '../../node.service';

@Component({
  selector: 'app-tree-node',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNodeComponent implements AfterViewInit {
  @Input()
  node!: TreeNode;

  @Input()
  set height(h: number) {
    this.elHeight = h;
    this.calculateStyling(h);
  }

  get height(): number {
    return this.elHeight;
  }

  elHeight!: number;

  @ViewChild('containerEl')
  containerEl!: ElementRef;

  constructor(private renderer: Renderer2, private nodeService: NodeService, private elRef: ElementRef, private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.calculateStyling(this.elHeight);
  }

  click(event: MouseEvent): void {
    this.nodeService.updateNodeTree(this.node, this.nodeService.changeCurrentNode);
  }

  calculateStyling(height: number): void {
    if (this.elRef) {
      this.renderer.setStyle(this.elRef.nativeElement, 'height', `${this.elHeight}px`);
    }

    if (this.containerEl) {
      this.renderer.setStyle(this.containerEl.nativeElement, 'margin-top', `${this.height}px`);
    }
  }
}
