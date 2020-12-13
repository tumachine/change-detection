import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener, Input,
  OnInit, Output,
  ViewChild,
  EventEmitter
} from '@angular/core';
import { NodeService, TreeState } from '../node.service';
import { TreeNode } from './tree-node';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent implements AfterViewInit {
  height!: number;

  @Input()
  node!: TreeNode;

  @Input()
  set treeState(ts: TreeState) {
    this.ts = ts;
    this.calculateStyling();
  }

  ts!: TreeState;

  @ViewChild('treeContainer')
  treeContainer!: ElementRef<HTMLDivElement>;

  @HostListener('window:resize', ['$event'])
  sizeChange(event: UIEvent): void {
    console.log('size change');
    this.calculateStyling();
  }

  constructor(private nodeService: NodeService, private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.calculateStyling();
    this.cdRef.detectChanges();
  }

  calculateStyling(): void {
    if (this.treeContainer) {
      this.height = this.treeContainer.nativeElement.getBoundingClientRect().height / this.ts.depth;
    }
  }
}
