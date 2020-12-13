import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NodeService } from '../node.service';
import { TreeNode } from '../tree/tree-node';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlComponent {
  @Input()
  currentNode!: TreeNode | null;
}
