import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
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
  nodes: TreeNode[] = [];

  @Input()
  depth!: number;

  @Input()
  set height(h: number) {
    this.elHeight = h;
    this.calculateStyling(h);
  }

  get height(): number {
    return this.elHeight;
  }

  @ViewChildren('nodeEl')
  nodeEls!: QueryList<ElementRef>;

  @ViewChild('containerEl')
  containerEl!: ElementRef;

  elHeight!: number;

  constructor(private renderer: Renderer2, private nodeService: NodeService) {}

  ngAfterViewInit(): void {
    this.calculateStyling(this.elHeight);
  }

  click(event: MouseEvent, index: number): void {
    this.nodeService.currentNodeNext(this.nodes[index]);
    // if (this.nodes) {
    //   this.nodeService.currentNodeSubject$.next(this.nodes[index]);
    // }
  }

  calculateStyling(height: number): void {
    if (this.nodeEls && this.containerEl) {
      this.nodeEls.forEach(({nativeElement}) => {
        this.renderer.setStyle(nativeElement, 'height', `${this.elHeight}px`);
      });

      if (this.depth !== 0) {
        this.renderer.setStyle(this.containerEl.nativeElement, 'margin-top', `${this.height}px`);
      }
    }
  }
}
