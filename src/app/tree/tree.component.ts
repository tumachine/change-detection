import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener, Input,
  ViewChild,
} from '@angular/core';
import { NodeService, TreeNodeAsComponent } from '../node.service';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent implements AfterViewInit {
  @Input()
  set root(ts: TreeNodeAsComponent) {
    this.rt = ts;
    this.d = ts.getDepth();
    this.calculateStyling();
  }

  @Input()
  set depth(d: number | null) {
    this.d = d ? d : 0;
    this.calculateStyling();
  }

  height!: number;
  rt!: TreeNodeAsComponent;
  d!: number;

  @ViewChild('treeContainer')
  treeContainer!: ElementRef<HTMLDivElement>;

  @HostListener('window:resize', ['$event'])
  sizeChange(event: UIEvent): void {
    this.calculateStyling();
  }

  constructor(private nodeService: NodeService, private cdRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.calculateStyling();
    this.cdRef.detectChanges();
  }

  calculateStyling(): void {
    if (this.treeContainer) {
      this.height = this.treeContainer.nativeElement.getBoundingClientRect().height / this.d;
    }
  }
}
