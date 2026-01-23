import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';

@Component({
    selector: 'app-sucursales',
    standalone: true,
    imports: [CommonModule, HeaderComponent],
    templateUrl: './Sucursales.component.html',
    styleUrls: ['./Sucursales.component.css']
})
export class SucursalesComponent implements OnInit {

    idCentro = '';
    nombreCentro = '';

    constructor(
        private route: ActivatedRoute,

    ) { }

    ngOnInit(): void {

        this.idCentro = this.route.snapshot.paramMap.get('idCentro') ?? '';
        this.nombreCentro = this.route.snapshot.queryParamMap.get('nombre') ?? '';
    }

    volver(): void {
        //  this.router.navigate(['/centrocostos']);
    }
}
