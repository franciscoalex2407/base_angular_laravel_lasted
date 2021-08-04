import { HttpBackend, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

import { sha256 } from 'js-sha256';
import { KJUR, KEYUTIL, stob64, hextorstr } from 'jsrsasign';
import { MessageService } from "./message.service";

declare var qz;

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  base_url = environment.base_url;

  qzStatus = false;

  config_erp: any = {};

  constructor(
    private httpBackend: HttpBackend,
    private message: MessageService
  ) { }


  getAddressAPI(cep): Promise<any> {
    cep = cep.replace(/[^0-9]/g, '');
    const http = new HttpClient(this.httpBackend);
    return http.get(`https://viacep.com.br/ws/${cep}/json`).toPromise();
  }

  getBusinessAPI(cnpj): Promise<any> {
    cnpj = cnpj.replace(/[^0-9]/g, '');
    const http = new HttpClient(this.httpBackend);
    return http.get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`).toPromise();
  }


  money(n, c = 2, d = ',', t = '.') {
    let s: any; let i: any; let j: any;

    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d === undefined ? ',' : d;
    t = t === undefined ? '.' : t;
    s = n < 0 ? '-' : '';
    // tslint:disable-next-line: radix
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '';
    j = (j = i.length) > 3 ? j % 3 : 0;
    // tslint:disable-next-line: max-line-length
    return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
  }

  nova_data(i = 0) {
    const data = new Date();

    let dia: any = data.getDate();
    let mes: any = data.getMonth() + 1 + i;
    let ano = data.getFullYear();

    if (mes >= 13) { //se passar do mês 12, então inicia com o mes 1 do próximo ano
      mes = 1;
      ano = ano + 1;
    }

    if (mes == 2 && dia > 28) {
      dia = 28;
    }

    if (mes == 4 && dia > 30 || mes == 6 && dia > 30 || mes == 9 && dia > 30 || mes == 11 && dia > 30) {
      dia = 30;
    }

    dia = (dia < 10) ? '0' + dia : dia;
    mes = (mes < 10) ? '0' + mes : mes;

    return ano + '-' + mes + '-' + dia;
  }

  splashScreen(action = true) {
    const loading = document.getElementById('loading');
    if (action) {
      loading.style.display = 'flex';
    } else {
      loading.style.display = 'none';
    }
  }

  firstFileToBase64(fileImage: File): Promise<{}> {
    return new Promise((resolve, reject) => {
      let fileReader: FileReader = new FileReader();
      if (fileReader && fileImage != null) {
        fileReader.readAsDataURL(fileImage);
        fileReader.onload = () => {
          resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
          reject(error);
        };
      } else {
        reject(new Error('No file found'));
      }
    });
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async startQZ() {
    await qz.security.setCertificatePromise(async (resolve, reject) => {
      await fetch("assets/pluginQZ/signing/digital-certificate.txt", { cache: 'no-store', headers: { 'Content-Type': 'text/plain' } })
        .then(data => resolve(data.text()));
    });

    console.log('setCertificatePromise');

    await qz.security.setSignaturePromise(hash => {
      return async (resolve, reject) => {
        await fetch("assets/pluginQZ/signing/private-key.pem", { cache: 'no-store', headers: { 'Content-Type': 'text/plain' } })
          .then(wrapped => wrapped.text())
          .then(data => {

            var pk = KEYUTIL.getKey(data);
            var sig = new KJUR.crypto.Signature({ "alg": "SHA1withRSA" });
            sig.init(pk);
            sig.updateString(hash);
            var hex = sig.sign();
            // console.log("DEBUG: \n\n" + stob64(hextorstr(hex)));

            resolve(stob64(hextorstr(hex)));
          })
          .catch(err => console.error(err));
      };
    });

    await qz.api.setSha256Type(data => sha256(data));
    await qz.api.setPromiseType(function promise(resolver) { return new Promise(resolver); });

    await qz.websocket.connect({ retries: 3, delay: 1 }).catch(err => {
      console.log('err qz', err);
      return this.message.toastError('Falha na comunicação com o QZ', 'Impressão falhou!');
    });

    this.qzStatus = true;
  }

  async checkQZ() {
    if (!this.qzStatus) {
      await this.startQZ();
    }
    console.log(this.qzStatus);
    return this.qzStatus;
  }

  async listPrints() {
    await this.checkQZ()

    return await qz.printers.find();
  }

  async send_print(data) {
    const config_erp = localStorage.getItem('printOne_erp');

    if (config_erp == null || config_erp == undefined) {
      await this.config_print(data);
    } else {
      await this.printing(data, config_erp);
    }
  }

  async printing(base64, printer) {
    await this.checkQZ();

    console.log(printer, base64);
    const config = await qz.configs.create(printer);

    const data = [
      {
        type: 'raw',
        format: 'base64',
        data: base64
      }
    ];

    await qz.print(config, data).then(() => localStorage.setItem('printOne_erp', printer))
      .catch((e) => { this.message.alertErro('Falha ao imprimir: ' + JSON.stringify(e)) });
  }

  async config_print(data) {
    const printers = await this.listPrints();

    const { value: printer } = await this.message.swal.fire({
      title: 'Configurar Impressora',
      html: 'Você ainda não configurou uma impressora padrão, selecione uma opção para configurar!<br>',
      input: 'select',
      customClass: {
        input: 'form-control',
      },
      inputOptions: printers,
      inputPlaceholder: 'Selecione uma Impressora',
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Voltar',
    });

    if (printer) {
      await this.printing(data, printers[printer]);
    }
  }

}
