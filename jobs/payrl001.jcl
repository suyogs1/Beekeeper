//PAYRL001 JOB (ACCT123),'PAYROLL PROCESSING',
//         CLASS=A,MSGCLASS=X,NOTIFY=&SYSUID
//*
//* PAYROLL PROCESSING JOB - MONTHLY RUN
//* INCLUDES: SORT, TAX CALCULATION, REPORT GENERATION
//*
//JOBLIB   DD DSN=PROD.LOAD.LIB,DISP=SHR
//         DD DSN=SYS1.LINKLIB,DISP=SHR
//*
//*-----------------------------------------------------------
//* STEP 1: SORT EMPLOYEE DATA
//*-----------------------------------------------------------
//SORTDATA EXEC PGM=SORT
//STEPLIB  DD DSN=SYS1.SORTLIB,DISP=SHR
//SYSOUT   DD SYSOUT=*
//SORTIN   DD DSN=PAYROLL.EMPLOYEE.DATA,DISP=SHR
//SORTOUT  DD DSN=PAYROLL.SORTED.DATA,
//            DISP=(NEW,CATLG,DELETE),
//            UNIT=SYSDA,
//            SPACE=(CYL,(10,5),RLSE)
//SYSIN    DD *
  SORT FIELDS=(1,9,CH,A)
/*
//*
//*-----------------------------------------------------------
//* STEP 2: CALCULATE TAXES
//* ISSUE: Missing STEPLIB - will cause S806 ABEND
//*-----------------------------------------------------------
//TAXCALC  EXEC PGM=TAXCALC
//SYSOUT   DD SYSOUT=*
//EMPIN    DD DSN=PAYROLL.SORTED.DATA,DISP=SHR
//TAXOUT   DD DSN=PAYROLL.TAX.RESULTS,
//            DISP=(NEW,CATLG,DELETE),
//            UNIT=SYSDA,
//            SPACE=(CYL,(5,2),RLSE)
//TAXRATES DD DSN=PAYROLL.TAX.RATES,DISP=SHR
//SYSIN    DD *
  YEAR=2024
  QUARTER=Q4
/*
//*
//*-----------------------------------------------------------
//* STEP 3: GENERATE PAYROLL REPORT
//*-----------------------------------------------------------
//GENRPT   EXEC PGM=RPTGEN
//STEPLIB  DD DSN=PROD.REPORT.LIB,DISP=SHR
//SYSOUT   DD SYSOUT=*
//TAXIN    DD DSN=PAYROLL.TAX.RESULTS,DISP=SHR
//EMPIN    DD DSN=PAYROLL.SORTED.DATA,DISP=SHR
//RPTOUT   DD DSN=PAYROLL.MONTHLY.REPORT,
//            DISP=(NEW,CATLG,DELETE),
//            UNIT=SYSDA,
//            SPACE=(TRK,(50,10),RLSE),
//            DCB=(RECFM=FBA,LRECL=133,BLKSIZE=1330)
//SUMMARY  DD DSN=PAYROLL.SUMMARY.DATA,
//            DISP=(NEW,CATLG,DELETE),
//            UNIT=SYSDA,
//            SPACE=(TRK,(10,5),RLSE)
//SYSIN    DD *
  FORMAT=DETAILED
  INCLUDE_SUMMARY=YES
/*

//* Made with Bob
