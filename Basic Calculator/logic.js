export default class CalculatorLogic {
    constructor(){
      this.operators = ['x', '+', '-', '/', '^', '%'];
      this.currentOperator = null;
    }

    expo(num, exponent) {
      if(typeof(num) != Number && typeof(exponent) != Number){
        parseFloat(num); parseFloat(exponent);
      }
      if(exponent === 0){
        return 1;
      }
      if(exponent === 1){
        return num;
      } else {
          return num * this.expo(num, exponent-1);
      }
    }

    mult(texte) {
      return this.getNum1(texte) * this.getNum2(texte);   
    }

    division(texte) {
        return this.getNum1(texte) / this.getNum2(texte);
    }

    add(texte) {
        return this.getNum1(texte) + this.getNum2(texte);
    }

    substract(texte) {
        return this.getNum1(texte) - this.getNum2(texte);
    }

    getNum1(texte) {
      if(!texte.includes(" ")){
        return parseFloat(texte);
      } else {
        return this.getNum1(texte.slice(0, -1));
      }
    }

    getNum2(texte) {
      if(!texte.includes(" ")) {
        return parseFloat(texte);
      } else {
        return this.getNum2(texte.slice(1));
      }
    }

    modulo(texte) {
      return this.getNum1(texte) % this.getNum2(texte);
    }

    getOperator(texte) {
      let operator = [];
      for(const el of this.operators) {
        if(texte.includes(el))
          operator.push(el);
      }
      if(operator.length > 1) {
        console.log("trop d'operateurs");
      }
      return operator[0];
      return this.currentOperator;
    }

    getResult(texte) {
      switch(this.getOperator(texte)){
        case 'x' :
          return this.mult(texte);
          break;
        case '+' :
          return this.add(texte);
          break;
        case '/' :
          return this.division(texte);
          break;
        case '-':
          return this.substract(texte);
          break;
        case '^':
          return this.expo(this.getNum1(texte), this.getNum2(texte))
          break;
        case '%':
          return this.modulo(texte);
        default:
          return undefined;
          break;
      }
    }

};