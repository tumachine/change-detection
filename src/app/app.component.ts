import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NodeService, TreeNodeAsComponent } from './node.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(public nodeService: NodeService) {}

  root = this.nodeService.root;
  depth = this.nodeService.depth;
}
