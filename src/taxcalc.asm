***********************************************************************
* TAXCALC - PAYROLL TAX CALCULATION MODULE                            *
* PURPOSE: CALCULATE FEDERAL AND STATE TAXES FOR EMPLOYEE PAYROLL    *
* AUTHOR: MAINFRAME SYSTEMS TEAM                                      *
* DATE: 2024-01-15                                                    *
***********************************************************************
TAXCALC  CSECT
         USING *,R15              BASE REGISTER
         SAVE  (14,12),,*         SAVE REGISTERS
         LR    R12,R15            LOAD BASE
         USING TAXCALC,R12        ESTABLISH ADDRESSABILITY
         LA    R13,SAVEAREA       LOAD SAVE AREA ADDRESS
*
***********************************************************************
* INITIALIZE WORKING STORAGE                                          *
***********************************************************************
INIT     DS    0H
         ZAP   FEDTAX,=P'0'       ZERO FEDERAL TAX
         ZAP   STATETX,=P'0'      ZERO STATE TAX
         ZAP   TOTALTX,=P'0'      ZERO TOTAL TAX
*
***********************************************************************
* LOAD EMPLOYEE GROSS PAY FROM INPUT RECORD                           *
***********************************************************************
LOADPAY  DS    0H
         L     R3,=A(INREC)       LOAD INPUT RECORD ADDRESS
         PACK  GROSSPK,0(8,R3)    PACK GROSS PAY (OFFSET X'00')
         CP    GROSSPK,=P'0'      CHECK IF VALID
         BE    NOPAY              BRANCH IF ZERO
*
***********************************************************************
* CALCULATE FEDERAL TAX (22% RATE)                                    *
***********************************************************************
CALCFED  DS    0H
         ZAP   WORK1,GROSSPK      COPY GROSS TO WORK AREA
         MP    WORK1,=P'22'       MULTIPLY BY 22%
         DP    WORK1,=P'100'      DIVIDE BY 100
         ZAP   FEDTAX,WORK1(8)    STORE FEDERAL TAX
*
***********************************************************************
* LOAD TAX RATE FROM EXTERNAL TABLE (POTENTIAL S0C7 RISK AT X'48')   *
***********************************************************************
LOADRATE DS    0H                 OFFSET X'48' - CRITICAL SECTION
         L     R4,=A(RATETBL)     LOAD RATE TABLE ADDRESS
         MVC   RATEWORK,0(R4)     MOVE RATE TO WORK AREA
         PACK  RATEPK,RATEWORK    PACK RATE (RISK: INVALID DATA)
*        *** FORENSIC NOTE: IF RATETBL CONTAINS NON-NUMERIC DATA ***
*        *** THIS PACK INSTRUCTION WILL CAUSE S0C7 ABEND         ***
*
***********************************************************************
* CALCULATE STATE TAX USING LOADED RATE                               *
***********************************************************************
CALCST   DS    0H
         ZAP   WORK2,GROSSPK      COPY GROSS TO WORK AREA
         MP    WORK2,RATEPK       MULTIPLY BY STATE RATE
         DP    WORK2,=P'100'      DIVIDE BY 100
         ZAP   STATETX,WORK2(8)   STORE STATE TAX
*
***********************************************************************
* CALCULATE TOTAL TAX                                                 *
***********************************************************************
CALCTOT  DS    0H
         ZAP   TOTALTX,FEDTAX     START WITH FEDERAL
         AP    TOTALTX,STATETX    ADD STATE TAX
*
***********************************************************************
* STORE RESULTS TO OUTPUT RECORD                                      *
***********************************************************************
STOREOUT DS    0H
         L     R5,=A(OUTREC)      LOAD OUTPUT RECORD ADDRESS
         UNPK  0(10,R5),FEDTAX    UNPACK FEDERAL TAX
         OI    9(R5),X'F0'        FIX SIGN
         UNPK  10(10,R5),STATETX  UNPACK STATE TAX
         OI    19(R5),X'F0'       FIX SIGN
         UNPK  20(10,R5),TOTALTX  UNPACK TOTAL TAX
         OI    29(R5),X'F0'       FIX SIGN
*
***********************************************************************
* RETURN TO CALLER                                                    *
***********************************************************************
RETURN   DS    0H
         L     R13,SAVEAREA+4     RESTORE SAVE AREA
         RETURN (14,12),RC=0      RETURN TO CALLER
*
***********************************************************************
* ERROR HANDLING - NO PAY FOUND                                       *
***********************************************************************
NOPAY    DS    0H
         WTO   'TAXCALC: NO GROSS PAY FOUND'
         B     RETURN             RETURN WITH ERROR
*
***********************************************************************
* WORKING STORAGE                                                     *
***********************************************************************
SAVEAREA DS    18F                REGISTER SAVE AREA
GROSSPK  DS    PL8                PACKED GROSS PAY
FEDTAX   DS    PL8                PACKED FEDERAL TAX
STATETX  DS    PL8                PACKED STATE TAX
TOTALTX  DS    PL8                PACKED TOTAL TAX
WORK1    DS    PL16               WORK AREA 1
WORK2    DS    PL16               WORK AREA 2
RATEWORK DS    CL8                RATE WORK AREA
RATEPK   DS    PL4                PACKED RATE
*
***********************************************************************
* INPUT/OUTPUT AREAS                                                  *
***********************************************************************
INREC    DS    0CL80              INPUT RECORD
         DC    CL80' '            INITIALIZED TO SPACES
OUTREC   DS    0CL80              OUTPUT RECORD
         DC    CL80' '            INITIALIZED TO SPACES
RATETBL  DS    0CL8               STATE TAX RATE TABLE
         DC    C'00000550'        5.5% STATE TAX RATE
*        *** FORENSIC RISK: IF THIS CONTAINS 'XXXXXXXX' OR OTHER ***
*        *** NON-NUMERIC DATA, PACK AT OFFSET X'48' WILL ABEND   ***
*
         LTORG                    LITERAL POOL
         END   TAXCALC

* Made with Bob
