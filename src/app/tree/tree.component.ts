import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { NodeService } from '../node.service';
import { TreeNode } from './tree-node';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent implements OnInit, AfterViewInit {
  private maxNodeHeight!: number;

  get nodes(): TreeNode[] {
    return this.nodeService.nodes;
  }

  @ViewChild('treeContainer')
  treeContainer!: ElementRef<HTMLDivElement>;

  @HostListener('window:resize', ['$event'])
  sizeChange(event: UIEvent): void {
    console.log('size change');
    this.calculateStyling();
  }

  constructor(private nodeService: NodeService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.nodeService.autogenerateNodes(4, this.nodeService.createFirstNode(), 2);
  }

  ngAfterViewInit(): void {
    this.calculateStyling();
    this.cdRef.detectChanges();
  }

  get height(): number {
    return this.maxNodeHeight;
  }

  set height(h: number) {
    this.maxNodeHeight = h;
  }

  calculateStyling(): void {
    if (this.treeContainer) {
      this.height = this.treeContainer.nativeElement.getBoundingClientRect().height / this.nodeService.depth;
      // console.log(this.maxNodeHeight);
    }
  }
}
