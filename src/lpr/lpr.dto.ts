import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiParam, ApiProperty, ApiQuery, getSchemaPath } from "@nestjs/swagger";

export class CreateLprDto {
    @IsString()
    @ApiProperty()
    lpr_id: string;
  
    @IsString()
    @ApiProperty()
    title: string;

    @IsNumber()
    @ApiProperty()
    processType: number;

    @IsNumber()
    @ApiProperty()
    country : number;

    @IsBoolean()
    @ApiProperty()
    useROI: boolean;

    @IsBoolean()
    @ApiProperty()
    usePlateAlignment: boolean;

    @IsBoolean()
    @ApiProperty()
    mustMatchPattern: boolean;

    @IsBoolean()
    @ApiProperty()
    useGPU: boolean;

    @IsNumber()
    @ApiProperty()
    maxFPS: number;

    @IsBoolean()
    @ApiProperty()
    useDetection: boolean;
    
    @IsNumber()
    @ApiProperty()
    detectionConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    segmentationConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    ocrConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    alprConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    postProcessConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    postProcessSkipLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    processStopLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    maxSuccessfulAnalysisCount: number;
    
    @IsNumber()
    @ApiProperty()
    maxAnalysisCount: number;
    
    @IsNumber()
    @ApiProperty()
    minPlateWidth: number;
    
    @IsNumber()
    @ApiProperty()
    min2AnalysisInterval: number;

    @IsBoolean()
    @ApiProperty()
    useTypeAndModelRecognition: boolean;
    
    @IsNumber()
    @ApiProperty()
    typeModelRecognitionSkipLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    typeModelRecognitionStopLevelTh: number;

    @IsBoolean()
    @ApiProperty()
    useColorRecognition: boolean;
    
    @IsNumber()
    @ApiProperty()
    colorRecognitionSkipLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    colorRecognitionStopLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    trackingDistanceTh: number;
    
    @IsNumber()
    @ApiProperty()
    trackingInactiveTh: number;
    
    @IsNumber()
    @ApiProperty()
    trackingActiveTh: number;
    
    @IsNumber()
    @ApiProperty()
    tickCount: number;
}

export class UpdateLprDto {
      @IsString()
    @ApiProperty()
    title: string;

    @IsNumber()
    @ApiProperty()
    processType: number;

    @IsNumber()
    @ApiProperty()
    country : number;

    @IsBoolean()
    @ApiProperty()
    useROI: boolean;

    @IsBoolean()
    @ApiProperty()
    usePlateAlignment: boolean;

    @IsBoolean()
    @ApiProperty()
    mustMatchPattern: boolean;

    @IsBoolean()
    @ApiProperty()
    useGPU: boolean;

    @IsNumber()
    @ApiProperty()
    maxFPS: number;

    @IsBoolean()
    @ApiProperty()
    useDetection: boolean;
    
    @IsNumber()
    @ApiProperty()
    detectionConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    segmentationConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    ocrConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    alprConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    postProcessConfidenceTh: number;
    
    @IsNumber()
    @ApiProperty()
    postProcessSkipLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    processStopLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    maxSuccessfulAnalysisCount: number;
    
    @IsNumber()
    @ApiProperty()
    maxAnalysisCount: number;
    
    @IsNumber()
    @ApiProperty()
    minPlateWidth: number;
    
    @IsNumber()
    @ApiProperty()
    min2AnalysisInterval: number;

    @IsBoolean()
    @ApiProperty()
    useTypeAndModelRecognition: boolean;
    
    @IsNumber()
    @ApiProperty()
    typeModelRecognitionSkipLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    typeModelRecognitionStopLevelTh: number;

    @IsBoolean()
    @ApiProperty()
    useColorRecognition: boolean;
    
    @IsNumber()
    @ApiProperty()
    colorRecognitionSkipLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    colorRecognitionStopLevelTh: number;
    
    @IsNumber()
    @ApiProperty()
    trackingDistanceTh: number;
    
    @IsNumber()
    @ApiProperty()
    trackingInactiveTh: number;
    
    @IsNumber()
    @ApiProperty()
    trackingActiveTh: number;
    
    @IsNumber()
    @ApiProperty()
    tickCount: number;
}