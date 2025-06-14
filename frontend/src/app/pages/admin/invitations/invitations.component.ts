import { Component, inject, ViewChild } from "@angular/core"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { MatTableDataSource } from "@angular/material/table"
import { AdminService } from "../../../services/admin.service"
import { SnackbarService } from "../../../services/snackbar.service"
import type { TableColumn } from "../clients/clients.component"
import { RouterLink } from "@angular/router"
import { MaterialModule } from "../../../material-module"
import type { Invitation } from "@shared/db/Invitation"
import { SpinnerService } from "../../../services/spinner.service"

@Component({
  selector: "app-invitations",
  imports: [
    MaterialModule,
    RouterLink,
  ],
  templateUrl: "./invitations.component.html",
  styleUrl: "./invitations.component.scss",
})
export class InvitationsComponent {
  dataSource: MatTableDataSource<Invitation> = new MatTableDataSource()

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  columns: TableColumn<Invitation>[] = [
    {
      columnDef: "username",
      header: "Username",
      cell: element => element.username ?? "-",
    },
    {
      columnDef: "email",
      header: "Email",
      cell: element => element.email ?? "-",
    },
    {
      columnDef: "name",
      header: "Name",
      cell: element => element.name ?? "-",
    },
  ]

  displayedColumns = ([] as string[]).concat(this.columns.map(c => c.columnDef)).concat(["actions"])

  private adminService = inject(AdminService)
  private snackbarService = inject(SnackbarService)
  private spinnerService = inject(SpinnerService)

  async ngAfterViewInit() {
    // Assign the data to the data source for the table to render
    try {
      this.spinnerService.show()
      this.dataSource.data = await this.adminService.invitations()
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.sort
    } finally {
      this.spinnerService.hide()
    }
  }

  async delete(id: string) {
    try {
      this.spinnerService.show()
      await this.adminService.deleteInvitation(id)
      this.dataSource.data = this.dataSource.data.filter(g => g.id !== id)
      this.snackbarService.show("Invitation was deleted.")
    } catch (_e) {
      this.snackbarService.error("Could not delete invitation.")
    } finally {
      this.spinnerService.hide()
    }
  }
}
